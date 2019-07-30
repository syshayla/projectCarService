package com.example.projectmatrix.entity;

import javax.persistence.*;
import java.util.Date;

@Entity
public class ProductSale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int qty;
    private double unitPrice;
    private double totalPrice;
    private Date salesDate;
    @ManyToOne
    @JoinColumn(name = "product_id")
    private ProductPurchase productPurchase;

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;

    public ProductSale() {
    }

    public ProductSale(int qty, double unitPrice, double totalPrice, Date salesDate, ProductPurchase productPurchase, Company company) {
        this.qty = qty;
        this.unitPrice = unitPrice;
        this.totalPrice = totalPrice;
        this.salesDate = salesDate;
        this.productPurchase = productPurchase;
        this.company = company;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getQty() {
        return qty;
    }

    public void setQty(int qty) {
        this.qty = qty;
    }

    public double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(double unitPrice) {
        this.unitPrice = unitPrice;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public Date getSalesDate() {
        return salesDate;
    }

    public void setSalesDate(Date salesDate) {
        this.salesDate = salesDate;
    }

    public ProductPurchase getProductPurchase() {
        return productPurchase;
    }

    public void setProductPurchase(ProductPurchase productPurchase) {
        this.productPurchase = productPurchase;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }
}
