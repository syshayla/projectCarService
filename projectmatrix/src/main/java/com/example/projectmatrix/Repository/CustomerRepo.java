package com.example.projectmatrix.Repository;

import com.example.projectmatrix.entity.Car;
import com.example.projectmatrix.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepo extends JpaRepository<Customer, Long> {
    Customer findByName(String name);
}
