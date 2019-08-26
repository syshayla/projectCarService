package com.example.projectmatrix.controller;

import com.example.projectmatrix.Repository.*;
import com.example.projectmatrix.entity.Customer;
import com.example.projectmatrix.entity.ProductPurchase;
import com.example.projectmatrix.entity.ProductSummary;
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
@RequestMapping(value = "/summary/")
public class ProductSummaryController {
    @Autowired
    private ProductSummaryRepo productSummaryRepo;




    @GetMapping(value = "list")
    public String viewList(Model model){
        List<ProductSummary> list=this.productSummaryRepo.findAll();
        model.addAttribute("list", list);
        return "summary/list";
    }

}
