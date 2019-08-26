package com.example.projectmatrix.Repository;

import com.example.projectmatrix.entity.ProductPurchase;
import com.example.projectmatrix.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceRepo extends JpaRepository<Service, Long> {
    Service findByServiceCharge(Double serviceCharge);
}
