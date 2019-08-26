package com.example.projectmatrix.Repository;

import com.example.projectmatrix.entity.Product;
import com.example.projectmatrix.entity.ProductPurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepo extends JpaRepository<Product, Long> {
    Product findByCode(String code);
    Product findByName(String name);

}
