package com.example.projectmatrix.controller;

import com.example.projectmatrix.Repository.*;
import com.example.projectmatrix.entity.Product;
import com.example.projectmatrix.entity.ProductSummary;
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
@RequestMapping(value = "/pro/")
public class ProductsController {
    @Autowired
    private ProductRepo productRepo;
    @Autowired
    private PCatRepo producCatRepo;

    @Autowired
    private ProductSummaryRepo productSummaryRepo;

    @Autowired
    private CompanyRepo companyRepo;

    @GetMapping(value = "add")
    public String viewAdd(Model model){
        model.addAttribute("product",new Product());
        model.addAttribute("pcatList", this.producCatRepo.findAll());
        model.addAttribute("companyList", this.companyRepo.findAll());
        return "products/add";
    }
    @PostMapping(value = "/add")
    public String addRole(@Valid Product product, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            return "products/add";
        } else {
                                this.productRepo.save(product );
//ProductSummary(String code, int totalQty, int soldQty, int availableQty, double totalPurchaseAmount, double totalSoldAmount, double profit, ProductPurchase productPurchase, Company company)
            ProductSummary summary = new ProductSummary(product.getCode(), 0, 0, 0,
                   0.0, 0.0, 0.0, this.productRepo.findByCode(product.getCode()), product.getCompany());
            this.productSummaryRepo.save(summary);

            model.addAttribute("product",new Product());
            model.addAttribute("pcatList", this.producCatRepo.findAll());
            model.addAttribute("companyList", this.companyRepo.findAll());
            model.addAttribute("successMsg", "Save Successfully");
                }


        return "products/add";
    }

    @GetMapping(value = "/edit")
    public String viewEdit(){
        return "products/edit";
    }
    @GetMapping(value = "list")
    public String viewList(Model model){
        List<Product> list=this.productRepo.findAll();
        model.addAttribute("list", list);
        return "products/list";
    }
    @GetMapping(value = "delete/{id}")
    public String delete(@PathVariable Long id) {
        this.productRepo.deleteById(id);
        return "products/list";
    }


}
