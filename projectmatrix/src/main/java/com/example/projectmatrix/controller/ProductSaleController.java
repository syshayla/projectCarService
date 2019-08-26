package com.example.projectmatrix.controller;

import com.example.projectmatrix.Repository.*;
import com.example.projectmatrix.entity.Product;
import com.example.projectmatrix.entity.ProductSale;
import com.example.projectmatrix.entity.ProductSummary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.validation.Valid;
import java.util.Date;
import java.util.List;

@Controller
@RequestMapping(value = "/sale/")
public class ProductSaleController {
    @Autowired
    private ProductSaleRepo productSaleRepo;
    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private CompanyRepo companyRepo;

    @Autowired
    private ProductSummaryRepo productSummaryRepo;

    @GetMapping(value = "add")
    public String viewAdd(Model model){
        model.addAttribute("productSale",new ProductSale());
        model.addAttribute("productList", this.productRepo.findAll());
        model.addAttribute("companyList", this.companyRepo.findAll());
        return "productSale/add";
    }

    @Transactional
    @PostMapping(value = "/add")
    public String addRole(@Valid ProductSale productSale, BindingResult bindingResult, Model model) {
        productSale.setSalesDate(new Date());
        if (bindingResult.hasErrors()) {
            return "productSale/add";
        } else {

            this.productSaleRepo.save(productSale);

            /// product summary will be updated

            ProductSummary productSummary = this.productSummaryRepo.findByCode(productSale.getProduct().getCode());
            productSummary.setAvailableQty(productSummary.getAvailableQty() - productSale.getQty());
            productSummary.setSoldQty(productSummary.getSoldQty() + productSale.getQty());
            productSummary.setTotalSoldAmount(productSummary.getTotalSoldAmount() + productSale.getTotalPrice());
            productSummary.setProfit(productSummary.getTotalSoldAmount() - productSummary.getTotalPurchaseAmount());

            this.productSummaryRepo.save(productSummary);

            model.addAttribute("productSale",new ProductSale());
            model.addAttribute("productList", this.productRepo.findAll());
            model.addAttribute("companyList", this.companyRepo.findAll());
            model.addAttribute("successMsg", "Save Successfully");
                }


        return "productSale/add";
    }

    @GetMapping(value = "/edit")
    public String viewEdit(){
        return "productSale/edit";
    }
    @GetMapping(value = "list")
    public String viewList(Model model){
        List<ProductSale> list=this.productSaleRepo.findAll();
        model.addAttribute("list", list);
        return "productSale/list";
    }
    @GetMapping(value = "delete/{id}")
    public String delete(@PathVariable Long id) {
        this.productRepo.deleteById(id);
        return "productSale/list";
    }


}
