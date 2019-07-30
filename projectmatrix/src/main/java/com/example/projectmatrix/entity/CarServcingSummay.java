package com.example.projectmatrix.entity;

import javax.persistence.*;
import java.util.Date;

@Entity
public class CarServcingSummay {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne
    @JoinColumn(name = "car_id")
    private Car car;

    private double totalAmount;
    private double paidAmount;
    private double dueAmount;

    @Temporal(TemporalType.TIMESTAMP)
    private Date firstInDate;
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastOutDate;

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;

    public CarServcingSummay() {
    }

    public CarServcingSummay(Car car, double totalAmount, double paidAmount, double dueAmount, Date firstInDate, Date lastOutDate, Company company) {
        this.car = car;
        this.totalAmount = totalAmount;
        this.paidAmount = paidAmount;
        this.dueAmount = dueAmount;
        this.firstInDate = firstInDate;
        this.lastOutDate = lastOutDate;
        this.company = company;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Car getCar() {
        return car;
    }

    public void setCar(Car car) {
        this.car = car;
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

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }
}
