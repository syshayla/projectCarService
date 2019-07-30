package com.example.projectmatrix.Repository;

import com.example.projectmatrix.entity.Country;
import com.example.projectmatrix.entity.District;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DistrictRepo extends JpaRepository<District, Long> {
    District findByName(String name);
}
