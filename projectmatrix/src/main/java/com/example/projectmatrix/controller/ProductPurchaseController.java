package com.example.projectmatrix.controller;

import com.example.projectmatrix.Repository.*;
import com.example.projectmatrix.entity.*;
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
import java.util.*;

@Controller
@RequestMapping(value = "/purchase/")
public class ProductPurchaseController {
    @Autowired
    private ProductPurchaseRepo purchaseRepo;

    @Autowired
    private ProductRepo productRepo;
    @Autowired
    private CompanyRepo companyRepo;
    @Autowired
    private SupplierRepo supplierRepo;

    @Autowired
    private ProductSummaryRepo productSummaryRepo;


    @GetMapping(value = "add")
    public String viewAdd(Model model) {
        model.addAttribute("productPurchase", new ProductPurchase());
        model.addAttribute("proList", this.productRepo.findAll());

        model.addAttribute("supList", this.supplierRepo.findAll());
        model.addAttribute("companyList", this.companyRepo.findAll());
        return "productPurchase/add";
    }

    @Transactional
    @PostMapping(value = "/add")
    public String addRole(@Valid ProductPurchase productPurchase, BindingResult bindingResult, Model model) {
        productPurchase.setPurchaseDate(new Date());
       if (bindingResult.hasErrors()) {
       return "productPurchase/add";
        } else {
           if (productPurchase != null) {

//               double q=productPurchase.getQty();
//               double u=productPurchase.getUnitPrice();
//               double t=q*u;
//               productPurchase.getTotalPrice(t);

               this.purchaseRepo.save(productPurchase);
/// product summary will be updated

               ProductSummary productSummary = this.productSummaryRepo.findByCode(productPurchase.getProduct().getCode());
               productSummary.setAvailableQty(productSummary.getAvailableQty() + productPurchase.getQty());
               productSummary.setTotalPurchaseAmount(productSummary.getTotalPurchaseAmount() + productPurchase.getTotalPrice());
               productSummary.setTotalQty(productSummary.getTotalQty() + productPurchase.getQty());
               productSummary.setProfit(productSummary.getTotalSoldAmount() - (productSummary.getTotalPurchaseAmount()+productPurchase.getTotalPrice()));

               this.productSummaryRepo.save(productSummary);

               model.addAttribute("productPurchase", new ProductPurchase());
               model.addAttribute("proList", this.productRepo.findAll());

               model.addAttribute("supList", this.supplierRepo.findAll());
               model.addAttribute("companyList", this.companyRepo.findAll());
               model.addAttribute("successMsg", "Save Successfully");
           }

       }
        return "productPurchase/add";
    }
//    @PostMapping(value = "/add")
//    public String addRole(@Valid ProductPurchase productPurchase, BindingResult bindingResult, Model model) {
//        if (bindingResult.hasErrors()) {
//            return "productPurchase/add";
//        } else {
//            if (productPurchase != null) {
//                this.purchaseRepo.save(productPurchase);

                    ///////////product Summary
               //     Optional<ProductSummary> productSummary = this.productSummaryRepo.findByProductPurchase(this.purchaseRepo.findTopByOrderByIdDesc());
//
//                    if (productSummary.isPresent()) {
//                        int totalQty = productSummary.get().getTotalQty() +  productPurchase.getQty();
//                        int availQty = totalQty - productSummary.get().getSoldQty();
//                        double totalPrice = productSummary.get().getTotalPurchaseAmount() +  productPurchase.getTotalPrice();
//                        double profitAmount= productSummary.get().getTotalSoldAmount() - totalPrice;

//                        ProductSummary summary = new ProductSummary(productPurchase.getCode(),totalQty, productSummary.get().getSoldQty(), availQty,
//                                totalPrice, productSummary.get().getTotalSoldAmount(), profitAmount, productSummary.get().getProductPurchase(), productSummary.get().getCompany());
//                        summary.setId(productSummary.get().getId());
//                        this.productSummaryRepo.save(summary);


//                    } else {
//                       ProductSummary summary = new ProductSummary(productPurchase.getCode(), productPurchase.getQty(), 0, productPurchase.getQty(),
//                               productPurchase.getTotalPrice(), 0, 0, this.purchaseRepo.findTopByOrderByIdDesc(), productPurchase.getCompany());
//                        this.productSummaryRepo.save(summary);
//                    }





//
//                    model.addAttribute("productPurchase", new ProductPurchase());
//                model.addAttribute("proList", this.productRepo.findAll());
//                    model.addAttribute("pCatList", this.pCatRepo.findAll());
//                    model.addAttribute("supList", this.supplierRepo.findAll());
//                    model.addAttribute("companyList", this.companyRepo.findAll());
//                    model.addAttribute("successMsg", "Save Successfully");
//                }
//            }

//        return "productPurchase/add";
//    }

    @GetMapping(value = "/edit")
    public String viewEdit() {
        return "productPurchase/edit";
    }

    @GetMapping(value = "list")
    public String viewList(Model model) {
        List<ProductPurchase> list = this.purchaseRepo.findAll();
        model.addAttribute("list", list);
        return "productPurchase/list";
    }

    @GetMapping(value = "delete/{id}")
    public String delete(@PathVariable Long id) {
        this.purchaseRepo.deleteById(id);
        return "productPurchase/list";
    }

}
