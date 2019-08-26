package com.example.projectmatrix.Repository;

import com.example.projectmatrix.entity.Product;
import com.example.projectmatrix.entity.ProductSale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductSaleRepo extends JpaRepository<ProductSale, Long> {

    ProductSale findByName(String name);

}
