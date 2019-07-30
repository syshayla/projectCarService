package com.example.projectmatrix.entity;

import javax.persistence.*;
import java.util.Date;

@Entity
public class CarPaymentSummary {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private double totalAmount;
    private double paidAmount;
    private double dueAmount;

    @Temporal(TemporalType.TIMESTAMP)
    private Date firstInDate;
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastOutDate;


    @OneToOne
    @JoinColumn(name = "car_id")
    private Car car;

    public CarPaymentSummary() {
    }

    public CarPaymentSummary(double totalAmount, double paidAmount, double dueAmount, Date firstInDate, Date lastOutDate, Car car) {
        this.totalAmount = totalAmount;
        this.paidAmount = paidAmount;
        this.dueAmount = dueAmount;
        this.firstInDate = firstInDate;
        this.lastOutDate = lastOutDate;
        this.car = car;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Date getFirstInDate() {
        return firstInDate;
    }

    public void setFirstInDate(Date firstInDate) {
        this.firstInDate = firstInDate;
    }

    public Date getLastOutDate() {
        return lastOutDate;
    }

    public void setLastOutDate(Date lastOutDate) {
        this.lastOutDate = lastOutDate;
    }

    public Car getCar() {
        return car;
    }

    public void setCar(Car car) {
        this.car = car;
    }
}
