package com.example.projectmatrix.Repository;

import com.example.projectmatrix.entity.Role;
import com.example.projectmatrix.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplierRepo extends JpaRepository<Supplier, Long> {
    Supplier findByName(String name);
}
