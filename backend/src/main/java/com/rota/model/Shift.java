package com.rota.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "shifts")
public class Shift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "week_start", nullable = false)
    private LocalDate weekStart;

    /** MONDAY … SUNDAY */
    @Column(name = "day_of_week", nullable = false)
    private String dayOfWeek;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    private String notes;

    public Shift() {}

    // ── Getters & setters ────────────────────────────────────────────────

    public Long      getId()                  { return id; }
    public void      setId(Long id)           { this.id = id; }

    public Employee  getEmployee()            { return employee; }
    public void      setEmployee(Employee e)  { this.employee = e; }

    public LocalDate getWeekStart()           { return weekStart; }
    public void      setWeekStart(LocalDate d){ this.weekStart = d; }

    public String    getDayOfWeek()           { return dayOfWeek; }
    public void      setDayOfWeek(String d)   { this.dayOfWeek = d; }

    public LocalTime getStartTime()           { return startTime; }
    public void      setStartTime(LocalTime t){ this.startTime = t; }

    public LocalTime getEndTime()             { return endTime; }
    public void      setEndTime(LocalTime t)  { this.endTime = t; }

    public String    getNotes()               { return notes; }
    public void      setNotes(String n)       { this.notes = n; }
}
