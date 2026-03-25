package com.rota.model;

import jakarta.persistence.*;

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

    /** CSS hex colour, e.g. "#3B82F6" */
    @Column(nullable = false)
    private String colour;

    public Employee() {}

    public Employee(String name, String role, String colour) {
        this.name   = name;
        this.role   = role;
        this.colour = colour;
    }

    // ── Getters & setters ────────────────────────────────────────────────

    public Long getId()               { return id; }
    public void setId(Long id)        { this.id = id; }

    public String getName()           { return name; }
    public void   setName(String n)   { this.name = n; }

    public String getRole()           { return role; }
    public void   setRole(String r)   { this.role = r; }

    public String getColour()         { return colour; }
    public void   setColour(String c) { this.colour = c; }
}
