package com.example.projectmatrix.entity;

import javax.persistence.*;
import java.util.Set;

@Entity
public class Service {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double serviceCharge;
    private double productPrice;
    private double totalBill;


    @ManyToOne
    @JoinColumn(name = "car_id")
    private Car car;

    @ManyToOne
    @JoinColumn(name = "service_type_id")
    private ServiceType serviceType;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "service_product",
            joinColumns = @JoinColumn(name = "service_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id"))
    private Set<ProductPurchase> productPurchase;

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;


    public Service() {
    }

    public Service(double serviceCharge, double productPrice, double totalBill, Car car, ServiceType serviceType, Set<ProductPurchase> productPurchase, Company company) {
        this.serviceCharge = serviceCharge;
        this.productPrice = productPrice;
        this.totalBill = totalBill;
        this.car = car;
        this.serviceType = serviceType;
        this.productPurchase = productPurchase;
        this.company = company;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public double getServiceCharge() {
        return serviceCharge;
    }

    public void setServiceCharge(double serviceCharge) {
        this.serviceCharge = serviceCharge;
    }

    public double getProductPrice() {
        return productPrice;
    }

    public void setProductPrice(double productPrice) {
        this.productPrice = productPrice;
    }

    public double getTotalBill() {
        return totalBill;
    }

    public void setTotalBill(double totalBill) {
        this.totalBill = totalBill;
    }

    public Car getCar() {
        return car;
    }

    public void setCar(Car car) {
        this.car = car;
    }

    public ServiceType getServiceType() {
        return serviceType;
    }

    public void setServiceType(ServiceType serviceType) {
        this.serviceType = serviceType;
    }

    public Set<ProductPurchase> getProductPurchase() {
        return productPurchase;
    }

    public void setProductPurchase(Set<ProductPurchase> productPurchase) {
        this.productPurchase = productPurchase;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }
}
