package com.rota.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    /** RECEPTIONIST | GYM | MANAGER | LIFEGUARD | HOUSEKEEPER */
    @Column(nullable = false)
    private String role;

    /** MALE | FEMALE */
    @Column(nullable = false)
    private String gender;

    /** CSS hex colour, e.g. "#3B82F6" */
    @Column(nullable = false)
    private String colour;

    /** Minimum weekly contracted hours — scheduler targets this. */
    @Column(name = "contracted_hours", nullable = false)
    private int contractedHours;

    /**
     * Maximum weekly contracted hours for variable-contract staff (e.g. 32–40).
     * NULL means fixed contract (contractedHours is both min and max).
     */
    @Column(name = "max_contracted_hours")
    private Integer maxContractedHours;

    /**
     * Activity qualifications. Only MANAGER and LIFEGUARD may hold these.
     * Valid values: RIFLES | ARCHERY | AXE_THROWING
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "employee_qualifications",
        joinColumns = @JoinColumn(name = "employee_id")
    )
    @Column(name = "qualification")
    private Set<String> qualifications = new HashSet<>();

    /**
     * Days of the week the employee is available to work.
     * Valid values: MONDAY … SUNDAY
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "employee_availability",
        joinColumns = @JoinColumn(name = "employee_id")
    )
    @Column(name = "day_of_week")
    private Set<String> availability = new HashSet<>();

    public Employee() {}

    // ── Getters & setters ────────────────────────────────────────────────

    public Long    getId()                        { return id; }
    public void    setId(Long id)                 { this.id = id; }

    public String  getName()                      { return name; }
    public void    setName(String n)              { this.name = n; }

    public String  getRole()                      { return role; }
    public void    setRole(String r)              { this.role = r; }

    public String  getGender()                    { return gender; }
    public void    setGender(String g)            { this.gender = g; }

    public String  getColour()                    { return colour; }
    public void    setColour(String c)            { this.colour = c; }

    public int     getContractedHours()                    { return contractedHours; }
    public void    setContractedHours(int h)               { this.contractedHours = h; }

    public Integer getMaxContractedHours()                 { return maxContractedHours; }
    public void    setMaxContractedHours(Integer h)        { this.maxContractedHours = h; }

    public Set<String> getQualifications()        { return qualifications; }
    public void    setQualifications(Set<String> q){ this.qualifications = q; }

    public Set<String> getAvailability()          { return availability; }
    public void    setAvailability(Set<String> a) { this.availability = a; }
}
