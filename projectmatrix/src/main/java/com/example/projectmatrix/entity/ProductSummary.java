package com.example.projectmatrix.entity;

import javax.persistence.*;

@Entity
public class ProductSummary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String code;
    private int totalQty;
    private int soldQty;
    private int availableQty;

    private double totalPurchaseAmount;
    private double totalSoldAmount;
    private double profit;

@OneToOne
@JoinColumn(name = "product_id")
private Product product;

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;

    public ProductSummary() {
    }


    public ProductSummary(String code, int totalQty, int soldQty, int availableQty, double totalPurchaseAmount, double totalSoldAmount, double profit, Product product, Company company) {
        this.code = code;
        this.totalQty = totalQty;
        this.soldQty = soldQty;
        this.availableQty = availableQty;
        this.totalPurchaseAmount = totalPurchaseAmount;
        this.totalSoldAmount = totalSoldAmount;
        this.profit = profit;
        this.product = product;
        this.company = company;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public int getTotalQty() {
        return totalQty;
    }

    public void setTotalQty(int totalQty) {
        this.totalQty = totalQty;
    }

    public int getSoldQty() {
        return soldQty;
    }

    public void setSoldQty(int soldQty) {
        this.soldQty = soldQty;
    }

    public int getAvailableQty() {
        return availableQty;
    }

    public void setAvailableQty(int availableQty) {
        this.availableQty = availableQty;
    }

    public double getTotalPurchaseAmount() {
        return totalPurchaseAmount;
    }

    public void setTotalPurchaseAmount(double totalPurchaseAmount) {
        this.totalPurchaseAmount = totalPurchaseAmount;
    }

    public double getTotalSoldAmount() {
        return totalSoldAmount;
    }

    public void setTotalSoldAmount(double totalSoldAmount) {
        this.totalSoldAmount = totalSoldAmount;
    }

    public double getProfit() {
        return profit;
    }

    public void setProfit(double profit) {
        this.profit = profit;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }
}

