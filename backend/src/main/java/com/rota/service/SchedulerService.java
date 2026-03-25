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
 * Auto-scheduling service using a Most-Constrained-First strategy.
 *
 * Algorithm summary:
 *  1. RANK employees by availability size (ascending = fewest available days = most constrained).
 *  2. RANK days by number of available employees (ascending = hardest to fill).
 *  3. For each employee (most constrained first):
 *     a. Distribute contracted hours evenly across their available days (rounded to 30-min blocks,
 *        with leftover minutes assigned to the first N days so the total is exact).
 *     b. Position each shift centred within that day's opening hours.
 *  4. Save all shifts, then run the coverage check.
 *  5. Return the saved shifts plus a list of uncovered blocks ("DAY:HH:MM") so the UI can flag them.
 */
@Service
public class SchedulerService {

    // ── Opening hours: minutes since midnight ────────────────────────────
    private static final Map<String, int[]> OPENING = new LinkedHashMap<>();
    static {
        OPENING.put("MONDAY",    new int[]{6*60,      21*60+30});
        OPENING.put("TUESDAY",   new int[]{6*60,      22*60});
        OPENING.put("WEDNESDAY", new int[]{6*60,      21*60+30});
        OPENING.put("THURSDAY",  new int[]{6*60,      22*60});
        OPENING.put("FRIDAY",    new int[]{6*60,      21*60+30});
        OPENING.put("SATURDAY",  new int[]{7*60+30,   20*60+30});
        OPENING.put("SUNDAY",    new int[]{7*60+30,   20*60});
    }

    private static final String[] ALL_DAYS =
        {"MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"};

    private final ShiftRepository shiftRepo;

    public SchedulerService(ShiftRepository shiftRepo) {
        this.shiftRepo = shiftRepo;
    }

    // ── Public entry point ────────────────────────────────────────────────

    @Transactional
    public ScheduleResult generate(LocalDate weekStart, List<Employee> employees) {

        // 1. Clear any existing shifts for this week
        shiftRepo.deleteByWeekStart(weekStart);

        // 2. Sort employees: fewest available days first (most constrained)
        List<Employee> sorted = employees.stream()
            .filter(e -> !e.getAvailability().isEmpty())
            .sorted(Comparator.comparingInt(e -> e.getAvailability().size()))
            .collect(Collectors.toList());

        // 3. Rank days by how many employees are available on that day (ascending)
        List<String> daysByConstraint = Arrays.stream(ALL_DAYS)
            .sorted(Comparator.comparingLong(day ->
                employees.stream().filter(e -> e.getAvailability().contains(day)).count()))
            .collect(Collectors.toList());

        // 4. Build shifts
        List<Shift> toSave = new ArrayList<>();

        for (Employee emp : sorted) {
            // Employee's available days ordered by constraint (hardest first)
            List<String> empDays = daysByConstraint.stream()
                .filter(d -> emp.getAvailability().contains(d))
                .collect(Collectors.toList());

            if (empDays.isEmpty()) continue;

            int targetMins = emp.getContractedHours() * 60;
            int dayCount   = empDays.size();

            // Distribute target minutes across days, rounded to 30-min blocks,
            // so total stays exact.
            int baseMinsPerDay = (targetMins / dayCount / 30) * 30;
            int extraBlocks    = (targetMins - baseMinsPerDay * dayCount) / 30;
            // First `extraBlocks` days get baseMinsPerDay + 30

            for (int i = 0; i < empDays.size(); i++) {
                String day    = empDays.get(i);
                int[]  hours  = OPENING.get(day);
                if (hours == null) continue;

                int openMins  = hours[0];
                int closeMins = hours[1];
                int maxMins   = closeMins - openMins;

                int shiftMins = (i < extraBlocks)
                    ? baseMinsPerDay + 30
                    : baseMinsPerDay;

                // Clamp to the day's available window
                shiftMins = Math.min(shiftMins, maxMins);
                if (shiftMins <= 0) continue;

                // Centre the shift in the day's opening window
                int mid        = (openMins + closeMins) / 2;
                int rawStart   = mid - shiftMins / 2;
                // Snap to 30-min boundary
                int snapStart  = (rawStart / 30) * 30;
                // Clamp to opening hours
                snapStart = Math.max(openMins, Math.min(closeMins - shiftMins, snapStart));
                int snapEnd = snapStart + shiftMins;

                Shift s = new Shift();
                s.setEmployee(emp);
                s.setWeekStart(weekStart);
                s.setDayOfWeek(day);
                s.setStartTime(LocalTime.of(snapStart / 60, snapStart % 60));
                s.setEndTime(LocalTime.of(snapEnd   / 60, snapEnd   % 60));
                toSave.add(s);
            }
        }

        List<Shift> saved      = shiftRepo.saveAll(toSave);
        List<String> uncovered = computeUncoveredBlocks(saved);

        return new ScheduleResult(saved, uncovered);
    }

    // ── Coverage check ────────────────────────────────────────────────────

    /**
     * Returns a list of "DAY:HH:MM" strings for every 30-min block within
     * opening hours that fails ANY coverage requirement:
     *   - ≥1 RECEPTIONIST, ≥1 GYM, ≥1 MANAGER, ≥2 LIFEGUARD
     *   - ≥1 HOUSEKEEPER (a LIFEGUARD counts toward this)
     *   - ≥1 MALE and ≥1 FEMALE
     */
    public List<String> computeUncoveredBlocks(List<Shift> shifts) {
        List<String> uncovered = new ArrayList<>();

        for (String day : ALL_DAYS) {
            int[] hours = OPENING.get(day);
            List<Shift> dayShifts = shifts.stream()
                .filter(s -> day.equals(s.getDayOfWeek()))
                .collect(Collectors.toList());

            for (int t = hours[0]; t < hours[1]; t += 30) {
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
                    }
                    if ("MALE".equals(s.getEmployee().getGender()))   male++;
                    else if ("FEMALE".equals(s.getEmployee().getGender())) female++;
                }

                // Lifeguards count toward housekeeper coverage
                boolean covered = recep >= 1 && gym >= 1 && mgr >= 1
                        && lg >= 2
                        && (hk + lg) >= 1   // lifeguard satisfies housekeeper slot
                        && male >= 1 && female >= 1;

                if (!covered) {
                    uncovered.add(String.format("%s:%02d:%02d", day, t / 60, t % 60));
                }
            }
        }

        return uncovered;
    }

    // ── Result record ─────────────────────────────────────────────────────

    /** Returned by the scheduler endpoint. */
    public record ScheduleResult(
        List<Shift>   shifts,
        List<String>  uncoveredBlocks   // "DAY:HH:MM" for each flagged block
    ) {}
}
