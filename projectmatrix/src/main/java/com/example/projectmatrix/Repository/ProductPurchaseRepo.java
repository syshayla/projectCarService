package com.example.projectmatrix.Repository;

import com.example.projectmatrix.entity.Company;
import com.example.projectmatrix.entity.ProductPurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductPurchaseRepo extends JpaRepository<ProductPurchase, Long> {

    ProductPurchase findTopByOrderByIdDesc();

}
