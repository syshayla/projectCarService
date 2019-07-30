package com.example.projectmatrix.Repository;

import com.example.projectmatrix.entity.Employee;
import com.example.projectmatrix.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeRepo extends JpaRepository<Employee, Long> {
    Employee findByName(String name);
}
