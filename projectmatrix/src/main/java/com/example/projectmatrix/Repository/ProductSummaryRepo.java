package com.example.projectmatrix.Repository;

import com.example.projectmatrix.entity.Product;
import com.example.projectmatrix.entity.ProductPurchase;
import com.example.projectmatrix.entity.ProductSummary;
import com.example.projectmatrix.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductSummaryRepo extends JpaRepository<ProductSummary, Long> {
    ProductSummary findByCode(String code);

    Optional<ProductSummary> findByProduct(Product product);
}
