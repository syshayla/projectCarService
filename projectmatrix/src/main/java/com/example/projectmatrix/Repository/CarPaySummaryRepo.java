package com.example.projectmatrix.Repository;

import com.example.projectmatrix.entity.Car;
import com.example.projectmatrix.entity.CarPaymentSummary;
import com.example.projectmatrix.entity.Product;
import com.example.projectmatrix.entity.ProductSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CarPaySummaryRepo extends JpaRepository<CarPaymentSummary, Long> {
    CarPaymentSummary findByCar(String model);

    Optional<CarPaymentSummary> findByCar(Car car);
}
