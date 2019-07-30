package com.example.projectmatrix.Repository;

import com.example.projectmatrix.entity.City;
import com.example.projectmatrix.entity.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CityRepo extends JpaRepository<City, Long> {
    City findByName(String name);
}
