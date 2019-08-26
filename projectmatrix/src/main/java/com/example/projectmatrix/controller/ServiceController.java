package com.example.projectmatrix.controller;

import com.example.projectmatrix.Repository.*;
import com.example.projectmatrix.entity.Customer;
import com.example.projectmatrix.entity.ProductPurchase;
import com.example.projectmatrix.entity.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.validation.Valid;
import java.util.List;

@Controller
@RequestMapping(value = "/service/")
public class ServiceController {
    @Autowired
    private ServiceTypeRepo serviceTypeRepo;

    @Autowired
    private ServiceRepo serviceRepo;
    @Autowired
    private CompanyRepo companyRepo;
@Autowired
private  ProductPurchaseRepo productPurchaseRepo;
    @Autowired
    private CarRepo carRepo;


    @GetMapping(value = "add")
    public String viewAdd(Model model){
        model.addAttribute("service",new Service());
        model.addAttribute("servList", this.serviceTypeRepo.findAll());
        model.addAttribute("proList", this.productPurchaseRepo.findAll());
        model.addAttribute("carList", this.carRepo.findAll());
        model.addAttribute("companyList", this.companyRepo.findAll());
        return "services/add";
    }
    @PostMapping(value = "/add")
    public String addRole(@Valid Service service, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            return "services/add";
                } else {
                    this.serviceRepo.save(service );
                    model.addAttribute("service",new Service());
                    model.addAttribute("servList", this.serviceTypeRepo.findAll());
                    model.addAttribute("proList", this.productPurchaseRepo.findAll());
                    model.addAttribute("carList", this.carRepo.findAll());
                    model.addAttribute("companyList", this.companyRepo.findAll());
                    model.addAttribute("successMsg", "Save Successfully");
                }


        return "services/add";
    }

    @GetMapping(value = "/edit")
    public String viewEdit(){
        return "services/edit";
    }
    @GetMapping(value = "list")
    public String viewList(Model model){
        List<Service> list=this.serviceRepo.findAll();
        model.addAttribute("list", list);
        return "services/list";
    }
    @GetMapping(value = "delete/{id}")
    public String delete(@PathVariable Long id) {
        this.serviceRepo.deleteById(id);
        return "services/list";
    }

}
