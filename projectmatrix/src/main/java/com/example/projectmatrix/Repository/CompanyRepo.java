package com.example.projectmatrix.Repository;

import com.example.projectmatrix.entity.Company;
import com.example.projectmatrix.entity.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyRepo extends JpaRepository<Company, Long> {
    Company findByName(String name);
}
