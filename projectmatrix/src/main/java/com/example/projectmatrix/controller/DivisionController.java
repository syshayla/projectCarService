package com.example.projectmatrix.controller;

import com.example.projectmatrix.Repository.CountryRepo;
import com.example.projectmatrix.Repository.DivisionRepo;
import com.example.projectmatrix.Repository.RoleRepo;
import com.example.projectmatrix.Repository.UserRepo;
import com.example.projectmatrix.entity.Division;
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
@RequestMapping(value = "/division/")
public class DivisionController {
    @Autowired
    private DivisionRepo divisionRepo;
    @Autowired
    private CountryRepo countryRepo;

    @GetMapping(value = "add")
    public String viewAdd(Model model){
        model.addAttribute("division",new Division());
        model.addAttribute("conList", this.countryRepo.findAll());
        return "divisions/add";
    }
    @PostMapping(value = "/add")
    public String addRole(@Valid Division division, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            return "divisions/add";
        } else {
            if (division != null) {
                Division division1 = this.divisionRepo.findByName(division.getName());
                if (division1 != null) {
                    model.addAttribute("existMsg", "UserName is already exist");
                } else {
                    this.divisionRepo.save(division);
                    model.addAttribute("Division", new Division());
                    model.addAttribute("successMsg", "Save Successfully");
                }
            }
        }
        return "divisions/add";
    }

    @GetMapping(value = "/edit")
    public String viewEdit(){
        return "divisions/edit";
    }
    @GetMapping(value = "list")
    public String viewList(Model model){
        List<Division> list=this.divisionRepo.findAll();
        model.addAttribute("list", list);
        return "divisions/list";
    }
    @GetMapping(value = "delete/{id}")
    public String delete(@PathVariable Long id) {
        this.divisionRepo.deleteById(id);
        return "divisions/list";
    }


}
