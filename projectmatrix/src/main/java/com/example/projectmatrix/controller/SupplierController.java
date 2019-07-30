package com.example.projectmatrix.controller;

import com.example.projectmatrix.Repository.RoleRepo;
import com.example.projectmatrix.Repository.SupplierRepo;
import com.example.projectmatrix.entity.Role;
import com.example.projectmatrix.entity.Supplier;
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
@RequestMapping(value = "/sup/")
public class SupplierController {
    @Autowired
    private SupplierRepo supplierRepo;

    @GetMapping(value = "add")
    public String viewAdd(Model model){
        model.addAttribute("supplier",new Supplier());
        return "suppliers/add";
    }
    @PostMapping(value = "/add")
    public String addRole(@Valid Supplier supplier, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            return "suppliers/add";
        } else {
            if (supplier != null) {
                Supplier supplier1 = this.supplierRepo.findByName(supplier.getName());
                if (supplier1 != null) {
                    model.addAttribute("existMsg", "SupplierName is already exist");
                } else {
                    this.supplierRepo.save(supplier);
                    model.addAttribute("supplier", new Supplier());
                    model.addAttribute("successMsg", "Save Successfully");
                }
            }
        }
        return "suppliers/add";
    }

    @GetMapping(value = "/edit")
    public String viewEdit(){
        return "suppliers/edit";
    }
    @GetMapping(value = "list")
    public String viewList(Model model){
        List<Supplier> list=this.supplierRepo.findAll();
        model.addAttribute("list", list);
        return "suppliers/list";
    }
}
