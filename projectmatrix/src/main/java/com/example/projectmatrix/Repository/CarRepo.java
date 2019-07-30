package com.example.projectmatrix.Repository;

import com.example.projectmatrix.entity.Car;
import com.example.projectmatrix.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarRepo extends JpaRepository<Car, Long> {
    Car findByCarModel(String carmodel);
}
