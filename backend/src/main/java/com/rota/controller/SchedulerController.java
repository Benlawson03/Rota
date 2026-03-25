package com.rota.controller;

import com.rota.repository.EmployeeRepository;
import com.rota.service.SchedulerService;
import com.rota.service.SchedulerService.ScheduleResult;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * POST /api/scheduler/generate?weekStart=YYYY-MM-DD
 *
 * Runs the auto-scheduler for the given week:
 *  1. Clears existing shifts for that week.
 *  2. Generates new shifts using the Most-Constrained-First algorithm.
 *  3. Saves the shifts to the database.
 *  4. Returns the generated shifts and any uncovered 30-min blocks.
 *
 * weekStart must be a Monday.
 */
@RestController
@RequestMapping("/api/scheduler")
public class SchedulerController {

    private final SchedulerService   schedulerService;
    private final EmployeeRepository employeeRepo;

    public SchedulerController(SchedulerService schedulerService,
                               EmployeeRepository employeeRepo) {
        this.schedulerService = schedulerService;
        this.employeeRepo     = employeeRepo;
    }

    @PostMapping("/generate")
    public ScheduleResult generate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        return schedulerService.generate(weekStart, employeeRepo.findAll());
    }
}
