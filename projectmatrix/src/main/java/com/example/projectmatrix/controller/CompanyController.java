package com.example.projectmatrix.controller;

import com.example.projectmatrix.Repository.CityRepo;
import com.example.projectmatrix.Repository.CompanyRepo;
import com.example.projectmatrix.Repository.RoleRepo;
import com.example.projectmatrix.Repository.UserRepo;
import com.example.projectmatrix.entity.Company;
import com.example.projectmatrix.entity.User;
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
@RequestMapping(value = "/company/")
public class CompanyController {
    @Autowired
    private CompanyRepo companyRepo;
    @Autowired
    private CityRepo cityRepo;

    @GetMapping(value = "add")
    public String viewAdd(Model model){
        model.addAttribute("company",new Company());
        model.addAttribute("citiList", this.cityRepo.findAll());
        return "company/add";
    }
    @PostMapping(value = "/add")
    public String addRole(@Valid Company company, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            return "company/add";
        } else {
            if (company != null) {
                Company company1 = this.companyRepo.findByName(company.getName());
                if (company1 != null) {
                    model.addAttribute("existMsg", "UserName is already exist");
                } else {
                    this.companyRepo.save(company );
                    model.addAttribute("company", new Company());
                    model.addAttribute("successMsg", "Save Successfully");
                }
            }
        }
        return "company/add";
    }

    @GetMapping(value = "/edit")
    public String viewEdit(){
        return "company/edit";
    }
    @GetMapping(value = "list")
    public String viewList(Model model){
        List<Company> list=this.companyRepo.findAll();
        model.addAttribute("list", list);
        return "company/list";
    }

    @GetMapping(value = "delete/{id}")
    public String delete(@PathVariable Long id) {
        this.companyRepo.deleteById(id);
        return "company/list";
    }

}
