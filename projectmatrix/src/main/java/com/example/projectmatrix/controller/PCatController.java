package com.example.projectmatrix.controller;

import com.example.projectmatrix.Repository.PCatRepo;

import com.example.projectmatrix.entity.ProductCategory;
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
@RequestMapping(value = "/pcat/")
public class PCatController {
    @Autowired
    private PCatRepo pCatRepo;

    @GetMapping(value = "add")
    public String viewAdd(Model model){
        model.addAttribute("productCategory",new ProductCategory());
        return "productCat/add";
    }
    @PostMapping(value = "/add")
    public String addRole(@Valid ProductCategory productCategory, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            return "productCat/add";
        } else {
            if (productCategory != null) {
                ProductCategory pcat1= this.pCatRepo.findByName(productCategory.getName());
                if (pcat1 != null) {
                    model.addAttribute("existMsg", "Product name is already exist");
                } else {
                    this.pCatRepo.save(productCategory);
                    model.addAttribute("productCategory", new ProductCategory());
                    model.addAttribute("successMsg", "Save Successfully");
                }
            }
        }
        return "productCat/add";
    }

    @GetMapping(value = "/edit")
    public String viewEdit(){
        return "productCat/edit";
    }
    @GetMapping(value = "list")
    public String viewList(Model model){
        List<ProductCategory> list=this.pCatRepo.findAll();
        model.addAttribute("list", list);
        return "productCat/list";
    }
}
