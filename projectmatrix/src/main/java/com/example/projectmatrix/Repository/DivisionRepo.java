package com.example.projectmatrix.Repository;

import com.example.projectmatrix.entity.Country;
import com.example.projectmatrix.entity.Division;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DivisionRepo extends JpaRepository<Division, Long> {
    Division findByName(String name);
}
