package com.example.projectmatrix.entity;

        import javax.persistence.*;

@Entity
public class Car {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String carModel;
    private String licenseNo;
    private double totalAmount;
    private double paidAmount;
    @ManyToOne
    @JoinColumn(name = "customer_id")
    private  Customer customer;

    public Car() {
    }

    public Car(String carModel, String licenseNo, double totalAmount, double paidAmount, Customer customer) {
        this.carModel = carModel;
        this.licenseNo = licenseNo;
        this.totalAmount = totalAmount;
        this.paidAmount = paidAmount;
        this.customer = customer;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCarModel() {
        return carModel;
    }

    public void setCarModel(String carModel) {
        this.carModel = carModel;
    }

    public String getLicenseNo() {
        return licenseNo;
    }

    public void setLicenseNo(String licenseNo) {
        this.licenseNo = licenseNo;
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

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }
}
