package com.rota.controller;

import com.rota.model.Employee;
import com.rota.repository.EmployeeRepository;
import com.rota.repository.ShiftRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeRepository employeeRepo;
    private final ShiftRepository    shiftRepo;

    public EmployeeController(EmployeeRepository employeeRepo, ShiftRepository shiftRepo) {
        this.employeeRepo = employeeRepo;
        this.shiftRepo    = shiftRepo;
    }

    // GET /api/employees
    @GetMapping
    public List<Employee> getAll() {
        return employeeRepo.findAll();
    }

    // POST /api/employees
    @Transactional
    @PostMapping
    public Employee create(@RequestBody EmployeeRequest req) {
        Employee emp = new Employee();
        applyRequest(emp, req);
        return employeeRepo.save(emp);
    }

    // PUT /api/employees/:id
    @Transactional
    @PutMapping("/{id}")
    public ResponseEntity<Employee> update(@PathVariable Long id, @RequestBody EmployeeRequest req) {
        return employeeRepo.findById(id)
                .map(emp -> {
                    applyRequest(emp, req);
                    return ResponseEntity.ok(employeeRepo.save(emp));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/employees/:id — cascades shifts
    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!employeeRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        shiftRepo.deleteByEmployeeId(id);
        employeeRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ── Helper ────────────────────────────────────────────────────────────

    private void applyRequest(Employee emp, EmployeeRequest req) {
        emp.setName(req.name());
        emp.setRole(req.role());
        emp.setGender(req.gender());
        emp.setColour(req.colour());
        emp.setContractedHours(req.contractedHours());
        emp.setMaxContractedHours(req.maxContractedHours());

        // Replace collection contents in-place so JPA tracks the changes
        emp.getQualifications().clear();
        if (req.qualifications() != null) emp.getQualifications().addAll(req.qualifications());

        emp.getAvailability().clear();
        if (req.availability() != null) emp.getAvailability().addAll(req.availability());
    }

    // ── Request record ────────────────────────────────────────────────────

    /**
     * JSON body for POST /api/employees and PUT /api/employees/:id
     *
     * {
     *   "name":            "Alice Johnson",
     *   "role":            "RECEPTIONIST",
     *   "gender":          "FEMALE",
     *   "colour":          "#3B82F6",
     *   "contractedHours": 37,
     *   "qualifications":  [],
     *   "availability":    ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY"]
     * }
     *
     * qualifications: only relevant for MANAGER and LIFEGUARD.
     * availability: days they are able to work — scheduler will not assign
     * shifts outside these days.
     */
    public record EmployeeRequest(
            String      name,
            String      role,
            String      gender,
            String      colour,
            int         contractedHours,
            Integer     maxContractedHours,   // null = fixed contract
            Set<String> qualifications,
            Set<String> availability
    ) {}
}
