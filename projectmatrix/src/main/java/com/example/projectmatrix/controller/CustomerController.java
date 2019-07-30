package com.example.projectmatrix.controller;

import com.example.projectmatrix.Repository.*;
import com.example.projectmatrix.entity.Customer;
import com.example.projectmatrix.entity.Role;
import com.example.projectmatrix.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.validation.Valid;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Controller
@RequestMapping(value = "/cus/")
public class CustomerController {
    @Autowired
    private  CustomerRepo customerRepo;
    @Autowired
    private CompanyRepo companyRepo;

    @Autowired
    private CountryRepo countryRepo;

    @Autowired
    private CityRepo cityRepo;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private RoleRepo roleRepo;


    @GetMapping(value = "add")
    public String viewAdd(Model model){
        model.addAttribute("customer",new Customer());
        model.addAttribute("conList", this.countryRepo.findAll());
        model.addAttribute("citiList", this.cityRepo.findAll());
        model.addAttribute("companyList", this.companyRepo.findAll());
        return "customers/add";
    }
    @PostMapping(value = "/add")
    public String addRole(@Valid Customer customer, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            return "customers/add";
        } else {
            if (customer != null) {
                Customer customer1 = this.customerRepo.findByName(customer.getName());
                if (customer1 != null) {
                    model.addAttribute("existMsg", "UserName is already exist");
                } else {

                    Role role =roleRepo.findByRoleName("CUSTOMER");
                    Set<Role> roles = new HashSet<>();
                    roles.add(role);

                    User user =new User(customer.getName(), customer.getEmail(), "12345", customer.getEmail(), roles);
                    this.userRepo.save(user);

                    User user2 =this.userRepo.findByUserName(user.getUserName());
                    customer.setUser(user2);
                    this.customerRepo.save(customer);
                    model.addAttribute("customer",new Customer());
                    model.addAttribute("conList", this.countryRepo.findAll());
                    model.addAttribute("citiList", this.cityRepo.findAll());
                    model.addAttribute("companyList", this.companyRepo.findAll());
                    model.addAttribute("successMsg", "Save Successfully");
                }
            }
        }
        return "customers/add";
    }

    @GetMapping(value = "/edit")
    public String viewEdit(){
        return "customers/edit";
    }
    @GetMapping(value = "list")
    public String viewList(Model model){
        List<Customer> list=this.customerRepo.findAll();
        model.addAttribute("list", list);
        return "customers/list";
    }
}
