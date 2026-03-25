package com.rota.controller;

import com.rota.model.Shift;
import com.rota.repository.EmployeeRepository;
import com.rota.repository.ShiftRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/shifts")
public class ShiftController {

    private final ShiftRepository    shiftRepo;
    private final EmployeeRepository employeeRepo;

    public ShiftController(ShiftRepository shiftRepo, EmployeeRepository employeeRepo) {
        this.shiftRepo    = shiftRepo;
        this.employeeRepo = employeeRepo;
    }

    // GET /api/shifts?weekStart=YYYY-MM-DD
    @GetMapping
    public List<Shift> getByWeek(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        return shiftRepo.findByWeekStart(weekStart);
    }

    // POST /api/shifts
    @PostMapping
    public ResponseEntity<Shift> create(@RequestBody ShiftRequest req) {
        return employeeRepo.findById(req.employeeId())
                .map(emp -> {
                    Shift s = new Shift();
                    s.setEmployee(emp);
                    s.setWeekStart(req.weekStart());
                    s.setDayOfWeek(req.dayOfWeek());
                    s.setStartTime(LocalTime.parse(req.startTime()));
                    s.setEndTime(LocalTime.parse(req.endTime()));
                    s.setNotes(req.notes());
                    return ResponseEntity.ok(shiftRepo.save(s));
                })
                .orElse(ResponseEntity.badRequest().build());
    }

    // PUT /api/shifts/:id
    @PutMapping("/{id}")
    public ResponseEntity<Shift> update(@PathVariable Long id, @RequestBody ShiftRequest req) {
        return shiftRepo.findById(id)
                .map(s -> {
                    employeeRepo.findById(req.employeeId()).ifPresent(s::setEmployee);
                    s.setWeekStart(req.weekStart());
                    s.setDayOfWeek(req.dayOfWeek());
                    s.setStartTime(LocalTime.parse(req.startTime()));
                    s.setEndTime(LocalTime.parse(req.endTime()));
                    s.setNotes(req.notes());
                    return ResponseEntity.ok(shiftRepo.save(s));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/shifts/:id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!shiftRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        shiftRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/shifts/export?weekStart=YYYY-MM-DD  → downloads a CSV file
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {

        List<Shift> shifts = shiftRepo.findByWeekStart(weekStart);

        StringBuilder csv = new StringBuilder();
        csv.append("Employee,Role,Day,Start,End,Notes\n");
        for (Shift s : shifts) {
            csv.append(String.format("\"%s\",\"%s\",%s,%s,%s,\"%s\"\n",
                    s.getEmployee().getName(),
                    s.getEmployee().getRole(),
                    s.getDayOfWeek(),
                    s.getStartTime(),
                    s.getEndTime(),
                    s.getNotes() != null ? s.getNotes() : ""));
        }

        String filename = "rota-" + weekStart + ".csv";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.toString().getBytes());
    }

    // ── Inner record used for create/update request bodies ────────────────

    /**
     * JSON body expected for POST /api/shifts and PUT /api/shifts/:id
     *
     * Example:
     * {
     *   "employeeId": 1,
     *   "weekStart":  "2026-03-23",
     *   "dayOfWeek":  "MONDAY",
     *   "startTime":  "09:00",
     *   "endTime":    "17:00",
     *   "notes":      "Optional note"
     * }
     */
    public record ShiftRequest(
            Long       employeeId,
            LocalDate  weekStart,
            String     dayOfWeek,
            String     startTime,   // "HH:mm"
            String     endTime,     // "HH:mm"
            String     notes
    ) {}
}
