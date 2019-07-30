package com.example.projectmatrix.Repository;

import com.example.projectmatrix.entity.ProductCategory;
import com.example.projectmatrix.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PCatRepo extends JpaRepository<ProductCategory, Long> {
    ProductCategory findByName(String name);
}
