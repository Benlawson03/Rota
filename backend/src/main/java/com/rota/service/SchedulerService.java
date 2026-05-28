package com.rota.service;

import com.rota.model.Employee;
import com.rota.model.Shift;
import com.rota.repository.ShiftRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Auto-scheduling service.
 *
 * ── Algorithm overview ────────────────────────────────────────────────────
 *
 * PHASE 1 — PLAN (what shift lengths does each person work, and on which days?)
 *   1. Sort employees by available-day count (ascending = most constrained first).
 *   2. Sort days by available-employee count (ascending = hardest to fill first).
 *   3. For each employee, use backtracking to find a combination of valid shift
 *      lengths that sums exactly to their contracted hours.
 *      Valid lengths (hours): 4 | 6 | 7 | 8
 *      GYM and MANAGER on Saturday/Sunday may also use: 12
 *   4. Assign each shift length to a day (most-constrained day first).
 *
 * PHASE 2 — POSITION (what time does each shift start?)
 *   For each (day, role) group:
 *     - First shift  → anchored to opening time
 *     - Last shift   → anchored to closing time (ends at close)
 *     - Middle shifts → evenly spread between first and last
 *   This ensures the role is covered from open to close with no gaps whenever
 *   there are enough shifts; any remaining gaps are flagged in the result.
 *
 * COVERAGE CHECK
 *   Every 30-min block within opening hours is tested for:
 *     ≥1 RECEPTIONIST, ≥1 GYM, ≥1 MANAGER
 *     ≥2 LIFEGUARD (≥3 during outdoor pool hours 10:30–19:00)
 *     ≥1 HOUSEKEEPER (a LIFEGUARD counts toward this)
 *     ≥1 MALE and ≥1 FEMALE
 *   Failing blocks are returned as "DAY:HH:MM" strings.
 * ─────────────────────────────────────────────────────────────────────────
 */
@Service
public class SchedulerService {

    // ── Valid shift lengths ────────────────────────────────────────────────
    /** Standard allowed shift lengths (hours), sorted longest-first for greedy preference. */
    private static final int[] STANDARD_LENGTHS = {8, 7, 6, 4};

    /** Extra shift length (hours) available for GYM and MANAGER on weekends. */
    private static final int LONG_WEEKEND = 12;

    private static final Set<String> WEEKEND_DAYS      = Set.of("SATURDAY", "SUNDAY");
    private static final Set<String> LONG_SHIFT_ROLES  = Set.of("GYM", "MANAGER");

    // ── Opening hours: minutes since midnight ────────────────────────────
    private static final Map<String, int[]> OPENING = new LinkedHashMap<>();
    static {
        OPENING.put("MONDAY",    new int[]{6 * 60,        21 * 60 + 30});
        OPENING.put("TUESDAY",   new int[]{6 * 60,        22 * 60});
        OPENING.put("WEDNESDAY", new int[]{6 * 60,        21 * 60 + 30});
        OPENING.put("THURSDAY",  new int[]{6 * 60,        22 * 60});
        OPENING.put("FRIDAY",    new int[]{6 * 60,        21 * 60 + 30});
        OPENING.put("SATURDAY",  new int[]{7 * 60 + 30,   20 * 60 + 30});
        OPENING.put("SUNDAY",    new int[]{7 * 60 + 30,   20 * 60});
    }

    private static final String[] ALL_DAYS =
        {"MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"};

    // ── Outdoor pool: extra lifeguard required 10:30–19:00 ───────────────
    private static final int POOL_OPEN  = 10 * 60 + 30;   // 630 min
    private static final int POOL_CLOSE = 19 * 60;         // 1140 min

    private int requiredLifeguards(int blockStart) {
        return (blockStart >= POOL_OPEN && blockStart < POOL_CLOSE) ? 3 : 2;
    }

    // ── Repository ────────────────────────────────────────────────────────
    private final ShiftRepository shiftRepo;

    public SchedulerService(ShiftRepository shiftRepo) {
        this.shiftRepo = shiftRepo;
    }

    // ═════════════════════════════════════════════════════════════════════
    // PUBLIC ENTRY POINT
    // ═════════════════════════════════════════════════════════════════════

    @Transactional
    public ScheduleResult generate(LocalDate weekStart, List<Employee> employees) {

        // 1. Clear any existing shifts for this week
        shiftRepo.deleteByWeekStart(weekStart);

        // 2. Sort employees: most constrained (fewest available days) first
        List<Employee> sorted = employees.stream()
            .filter(e -> !e.getAvailability().isEmpty())
            .sorted(Comparator.comparingInt(e -> e.getAvailability().size()))
            .collect(Collectors.toList());

        // 3. Rank days: fewest available employees = hardest to fill = schedule first
        List<String> daysByConstraint = rankDays(employees);

        // 4. PHASE 1 — build shift plan (who works which day, for how long)
        List<PlannedShift> plan = new ArrayList<>();
        for (Employee emp : sorted) {
            plan.addAll(planEmployee(emp, daysByConstraint));
        }

        // 5. PHASE 2 — position each planned shift within the day's opening hours
        List<Shift> shifts = positionShifts(plan, weekStart);

        // 6. Persist and return with coverage gaps
        List<Shift> saved = shiftRepo.saveAll(shifts);
        return new ScheduleResult(saved, computeUncoveredBlocks(saved));
    }

    // ═════════════════════════════════════════════════════════════════════
    // PHASE 1 — SHIFT PLANNING
    // ═════════════════════════════════════════════════════════════════════

    /**
     * Determines which days this employee works and what shift length they do on each day,
     * such that the sum of shift lengths equals their contracted hours.
     */
    private List<PlannedShift> planEmployee(Employee emp, List<String> daysByConstraint) {
        // Get this employee's available days, ordered by constraint
        List<String> empDays = daysByConstraint.stream()
            .filter(d -> emp.getAvailability().contains(d))
            .collect(Collectors.toList());

        if (empDays.isEmpty()) return Collections.emptyList();

        int target = emp.getContractedHours();
        boolean canUseLongWeekend = LONG_SHIFT_ROLES.contains(emp.getRole());

        // ── GYM / MANAGER: try to slot a 12h shift on a weekend day ─────
        if (canUseLongWeekend) {
            Optional<String> weekendDay = empDays.stream()
                .filter(WEEKEND_DAYS::contains)
                .findFirst();

            if (weekendDay.isPresent() && target >= LONG_WEEKEND) {
                String wDay = weekendDay.get();
                int remaining = target - LONG_WEEKEND;

                List<String> otherDays = empDays.stream()
                    .filter(d -> !d.equals(wDay))
                    .collect(Collectors.toList());

                // Only commit to the 12h weekend plan if remaining hours fit exactly
                if (remaining == 0) {
                    return List.of(new PlannedShift(emp, wDay, LONG_WEEKEND));
                }

                List<Integer> restLengths = findLengths(remaining, otherDays.size());
                if (!restLengths.isEmpty()) {
                    List<PlannedShift> result = new ArrayList<>();
                    result.add(new PlannedShift(emp, wDay, LONG_WEEKEND));
                    for (int i = 0; i < restLengths.size(); i++) {
                        result.add(new PlannedShift(emp, otherDays.get(i), restLengths.get(i)));
                    }
                    return result;
                }
                // If no exact fit with 12h weekend, fall through to standard
            }
        }

        // ── Standard: backtrack to find exact shift-length combination ───
        List<Integer> lengths = findLengths(target, empDays.size());
        List<PlannedShift> result = new ArrayList<>();
        for (int i = 0; i < lengths.size(); i++) {
            result.add(new PlannedShift(emp, empDays.get(i), lengths.get(i)));
        }
        return result;
    }

    /**
     * Finds a list of valid shift lengths (from STANDARD_LENGTHS) that sum exactly
     * to {@code target} using at most {@code maxShifts} entries.
     *
     * Uses backtracking with lengths tried longest-first, so the result naturally
     * uses fewer, longer shifts (fewer days worked = more rest days).
     *
     * Returns an empty list if no exact solution exists; in that case the caller
     * falls back to {@link #fallbackLengths}.
     */
    private List<Integer> findLengths(int target, int maxShifts) {
        List<Integer> result = new ArrayList<>();
        if (backtrack(target, maxShifts, STANDARD_LENGTHS, result)) {
            return result;
        }
        return fallbackLengths(target, maxShifts);
    }

    /** Recursive backtracker — lengths must be sorted descending. */
    private boolean backtrack(int remaining, int maxShifts, int[] lengths, List<Integer> chosen) {
        if (remaining == 0) return true;
        if (maxShifts == 0) return false;
        // Prune: even filling all remaining slots with the smallest length isn't enough
        if (remaining < lengths[lengths.length - 1]) return false;

        for (int len : lengths) {
            if (len <= remaining) {
                chosen.add(len);
                if (backtrack(remaining - len, maxShifts - 1, lengths, chosen)) return true;
                chosen.remove(chosen.size() - 1);
            }
        }
        return false;
    }

    /**
     * Greedy fallback for edge cases where contracted hours can't be partitioned
     * exactly into valid lengths (e.g. 9h or 5h — very unusual in practice).
     * Schedules as close to target as possible; any shortfall will show in the
     * Hours Summary panel.
     */
    private List<Integer> fallbackLengths(int target, int maxShifts) {
        List<Integer> result = new ArrayList<>();
        int remaining = target;
        for (int i = 0; i < maxShifts && remaining > 0; i++) {
            int pick = STANDARD_LENGTHS[STANDARD_LENGTHS.length - 1]; // default: 4h
            for (int len : STANDARD_LENGTHS) {
                if (len <= remaining) { pick = len; break; }
            }
            result.add(pick);
            remaining -= pick;
        }
        return result;
    }

    // ═════════════════════════════════════════════════════════════════════
    // PHASE 2 — SHIFT POSITIONING
    // ═════════════════════════════════════════════════════════════════════

    /**
     * Converts planned shifts into timed Shift entities.
     *
     * For each (day, role) group:
     *   • 1 shift  → anchored to opening time
     *   • 2 shifts → first anchored to open, second anchored to close
     *   • 3+ shifts → first at open, last at close, middles evenly distributed
     *
     * This staggering strategy ensures the role has continuous coverage from
     * open to close whenever there are ≥2 employees of that role on that day.
     */
    private List<Shift> positionShifts(List<PlannedShift> plan, LocalDate weekStart) {
        // Group: day → role → list of planned shifts
        Map<String, Map<String, List<PlannedShift>>> byDayRole = new LinkedHashMap<>();
        for (String day : ALL_DAYS) byDayRole.put(day, new LinkedHashMap<>());

        for (PlannedShift p : plan) {
            byDayRole.get(p.day())
                .computeIfAbsent(p.employee().getRole(), k -> new ArrayList<>())
                .add(p);
        }

        List<Shift> shifts = new ArrayList<>();

        for (String day : ALL_DAYS) {
            int[] h        = OPENING.get(day);
            int openMins   = h[0];
            int closeMins  = h[1];

            for (List<PlannedShift> rolePlans : byDayRole.get(day).values()) {
                // Longest shifts first (they anchor the ends of the day)
                rolePlans.sort((a, b) -> b.lengthHours() - a.lengthHours());
                int n = rolePlans.size();

                for (int i = 0; i < n; i++) {
                    PlannedShift p       = rolePlans.get(i);
                    int shiftMins        = p.lengthHours() * 60;
                    int startMins;

                    if (n == 1 || i == 0) {
                        // Anchor to opening
                        startMins = openMins;
                    } else if (i == n - 1) {
                        // Anchor to closing
                        startMins = closeMins - shiftMins;
                    } else {
                        // Evenly distribute middle shifts between first-end and last-start
                        int firstEnd  = openMins  + rolePlans.get(0).lengthHours() * 60;
                        int lastStart = closeMins - rolePlans.get(n - 1).lengthHours() * 60;
                        // Linear interpolation for position i in [1 .. n-2]
                        startMins = firstEnd + (lastStart - firstEnd) * i / (n - 1);
                    }

                    // Snap to 30-min boundary then clamp within opening hours
                    startMins = (startMins / 30) * 30;
                    startMins = Math.max(openMins, Math.min(closeMins - shiftMins, startMins));
                    int endMins = startMins + shiftMins;

                    Shift s = new Shift();
                    s.setEmployee(p.employee());
                    s.setWeekStart(weekStart);
                    s.setDayOfWeek(day);
                    s.setStartTime(LocalTime.of(startMins / 60, startMins % 60));
                    s.setEndTime(  LocalTime.of(endMins   / 60, endMins   % 60));
                    shifts.add(s);
                }
            }
        }

        return shifts;
    }

    // ═════════════════════════════════════════════════════════════════════
    // COVERAGE CHECK
    // ═════════════════════════════════════════════════════════════════════

    /**
     * Returns "DAY:HH:MM" for every 30-min block that fails any coverage requirement.
     * Also used by SchedulerController to re-check manually edited rotas.
     */
    public List<String> computeUncoveredBlocks(List<Shift> shifts) {
        List<String> uncovered = new ArrayList<>();

        for (String day : ALL_DAYS) {
            int[] h = OPENING.get(day);
            List<Shift> dayShifts = shifts.stream()
                .filter(s -> day.equals(s.getDayOfWeek()))
                .collect(Collectors.toList());

            for (int t = h[0]; t < h[1]; t += 30) {
                int blockEnd = t + 30;
                int recep = 0, gym = 0, mgr = 0, lg = 0, hk = 0, male = 0, female = 0;

                for (Shift s : dayShifts) {
                    int sS = s.getStartTime().getHour() * 60 + s.getStartTime().getMinute();
                    int sE = s.getEndTime().getHour()   * 60 + s.getEndTime().getMinute();
                    if (sS > t || sE < blockEnd) continue;

                    switch (s.getEmployee().getRole()) {
                        case "RECEPTIONIST" -> recep++;
                        case "GYM"          -> gym++;
                        case "MANAGER"      -> mgr++;
                        case "LIFEGUARD"    -> lg++;
                        case "HOUSEKEEPER"  -> hk++;
                        // BEAUTY does not count toward mandatory coverage slots
                    }
                    if ("MALE".equals(s.getEmployee().getGender()))        male++;
                    else if ("FEMALE".equals(s.getEmployee().getGender())) female++;
                }

                boolean covered = recep >= 1 && gym >= 1 && mgr >= 1
                        && lg >= requiredLifeguards(t)
                        && (hk + lg) >= 1   // lifeguard can cover housekeeper
                        && male >= 1 && female >= 1;

                if (!covered) {
                    uncovered.add(String.format("%s:%02d:%02d", day, t / 60, t % 60));
                }
            }
        }

        return uncovered;
    }

    // ═════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═════════════════════════════════════════════════════════════════════

    /** Rank all 7 days by number of employees available on that day (ascending). */
    private List<String> rankDays(List<Employee> employees) {
        return Arrays.stream(ALL_DAYS)
            .sorted(Comparator.comparingLong(day ->
                employees.stream().filter(e -> e.getAvailability().contains(day)).count()))
            .collect(Collectors.toList());
    }

    // ── Internal record for shift planning ────────────────────────────────
    private record PlannedShift(Employee employee, String day, int lengthHours) {}

    // ── Public result record ──────────────────────────────────────────────
    public record ScheduleResult(
        List<Shift>  shifts,
        List<String> uncoveredBlocks   // "DAY:HH:MM" for each flagged 30-min block
    ) {}
}
