package com.example.projectmatrix.controller;

import com.example.projectmatrix.Repository.PCatRepo;
import com.example.projectmatrix.Repository.ServiceTypeRepo;
import com.example.projectmatrix.entity.ProductCategory;
import com.example.projectmatrix.entity.ServiceType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.validation.Valid;
import java.util.List;

@Controller
@RequestMapping(value = "/serType/")
public class ServiceTypeController {
    @Autowired
    private ServiceTypeRepo serviceTypeRepo;

    @GetMapping(value = "add")
    public String viewAdd(Model model){
        model.addAttribute("serviceType",new ServiceType());
        return "serviceType/add";
    }
    @PostMapping(value = "/add")
    public String addRole(@Valid ServiceType serviceType, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            return "serviceType/add";
        } else {
            if (serviceType != null) {
                ServiceType pcat1= this.serviceTypeRepo.findByName(serviceType.getName());
                if (pcat1 != null) {
                    model.addAttribute("existMsg", "Service Type is already exist");
                } else {
                    this.serviceTypeRepo.save(serviceType);
                    model.addAttribute("serviceType", new ServiceType());
                    model.addAttribute("successMsg", "Save Successfully");
                }
            }
        }
        return "serviceType/add";
    }

    @GetMapping(value = "/edit")
    public String viewEdit(){
        return "serviceType/edit";
    }
    @GetMapping(value = "list")
    public String viewList(Model model){
        List<ServiceType> list=this.serviceTypeRepo.findAll();
        model.addAttribute("list", list);
        return "serviceType/list";
    }
}
