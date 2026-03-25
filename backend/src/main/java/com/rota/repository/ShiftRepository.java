package com.rota.repository;

import com.rota.model.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {

    List<Shift> findByWeekStart(LocalDate weekStart);

    List<Shift> findByEmployeeId(Long employeeId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Shift s WHERE s.employee.id = :employeeId")
    void deleteByEmployeeId(@Param("employeeId") Long employeeId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Shift s WHERE s.weekStart = :weekStart")
    void deleteByWeekStart(@Param("weekStart") LocalDate weekStart);
}
