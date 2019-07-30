package com.example.projectmatrix.controller;

import com.example.projectmatrix.Repository.*;
import com.example.projectmatrix.entity.Customer;
import com.example.projectmatrix.entity.ProductPurchase;
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
@RequestMapping(value = "/product/")
public class ProductController {
    @Autowired
    private ProductPurchaseRepo purchaseRepo;

    @Autowired
    private  PCatRepo pCatRepo;
    @Autowired
    private CompanyRepo companyRepo;


    @Autowired
    private SupplierRepo supplierRepo;


    @GetMapping(value = "add")
    public String viewAdd(Model model){
        model.addAttribute("product",new ProductPurchase());
        model.addAttribute("pCatList", this.pCatRepo.findAll());
        model.addAttribute("supList", this.supplierRepo.findAll());
        model.addAttribute("companyList", this.companyRepo.findAll());
        return "productPurchase/add";
    }
    @PostMapping(value = "/add")
    public String addRole(@Valid ProductPurchase product, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            return "productPurchase/add";
        } else {
            if (product != null) {
                ProductPurchase purchase = this.purchaseRepo.findByName(product.getName());
                if (purchase != null) {
                    model.addAttribute("existMsg", "Product is already exist");
                } else {
                    this.purchaseRepo.save(product );
                    model.addAttribute("product",new Customer());
                    model.addAttribute("pCatList", this.pCatRepo.findAll());
                    model.addAttribute("supList", this.supplierRepo.findAll());
                    model.addAttribute("companyList", this.companyRepo.findAll());
                    model.addAttribute("successMsg", "Save Successfully");
                }
            }
        }
        return "productPurchase/add";
    }

    @GetMapping(value = "/edit")
    public String viewEdit(){
        return "productPurchase/edit";
    }
    @GetMapping(value = "list")
    public String viewList(Model model){
        List<ProductPurchase> list=this.purchaseRepo.findAll();
        model.addAttribute("list", list);
        return "productPurchase/list";
    }
}
