package com.rota.controller;

import com.rota.model.Employee;
import com.rota.repository.EmployeeRepository;
import com.rota.repository.ShiftRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    @PostMapping
    public Employee create(@RequestBody Employee employee) {
        return employeeRepo.save(employee);
    }

    // PUT /api/employees/:id
    @PutMapping("/{id}")
    public ResponseEntity<Employee> update(@PathVariable Long id, @RequestBody Employee updated) {
        return employeeRepo.findById(id)
                .map(emp -> {
                    emp.setName(updated.getName());
                    emp.setRole(updated.getRole());
                    emp.setColour(updated.getColour());
                    return ResponseEntity.ok(employeeRepo.save(emp));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/employees/:id  — cascades shifts via JPQL then removes employee
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!employeeRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        shiftRepo.deleteByEmployeeId(id);
        employeeRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
