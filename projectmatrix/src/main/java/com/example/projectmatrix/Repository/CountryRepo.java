package com.example.projectmatrix.Repository;

import com.example.projectmatrix.entity.Country;
import com.example.projectmatrix.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CountryRepo extends JpaRepository<Country, Long> {
    Country findByName(String name);
}
