package com.example.projectmatrix.entity;


import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class CompanyPaymentSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;


    private Supplier supplier;

    private double totalAmount;
    private double paidAmount;
    private double dueAmount;

    public CompanyPaymentSummary() {
    }

    public CompanyPaymentSummary(Long id, Supplier supplier, double totalAmount, double paidAmount, double dueAmount) {
        this.id = id;
        this.supplier = supplier;
        this.totalAmount = totalAmount;
        this.paidAmount = paidAmount;
        this.dueAmount = dueAmount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public double getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(double paidAmount) {
        this.paidAmount = paidAmount;
    }

    public double getDueAmount() {
        return dueAmount;
    }

    public void setDueAmount(double dueAmount) {
        this.dueAmount = dueAmount;
    }
}
