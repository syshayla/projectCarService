package com.example.projectmatrix.Repository;

import com.example.projectmatrix.entity.ProductCategory;
import com.example.projectmatrix.entity.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceTypeRepo extends JpaRepository<ServiceType, Long> {
    ServiceType findByName(String name);
}
