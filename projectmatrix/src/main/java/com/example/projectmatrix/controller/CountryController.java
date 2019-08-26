package com.example.projectmatrix.controller;

import com.example.projectmatrix.Repository.CountryRepo;
import com.example.projectmatrix.Repository.RoleRepo;
import com.example.projectmatrix.entity.Country;
import com.example.projectmatrix.entity.Role;
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
@RequestMapping(value = "/con/")
public class CountryController {
    @Autowired
    private CountryRepo countryRepo;

    @GetMapping(value = "add")
    public String viewAdd(Model model){
        model.addAttribute("country",new Country());
        return "country/add";
    }
    @PostMapping(value = "/add")
    public String addRole(@Valid Country country, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            return "country/add";
        } else {
            if (country != null) {
                Country country1 = this.countryRepo.findByName(country.getName());
                if (country1 != null) {
                    model.addAttribute("existMsg", "RoleName is already exist");
                } else {
                    this.countryRepo.save(country);
                    model.addAttribute("role", new Country());
                    model.addAttribute("successMsg", "Save Successfully");
                }
            }
        }
        return "country/add";
    }

    @GetMapping(value = "/edit")
    public String viewEdit(){
        return "country/edit";
    }

    @GetMapping(value = "list")
    public String viewList(Model model){
        List<Country> list=this.countryRepo.findAll();
        model.addAttribute("list", list);
        return "country/list";
    }

    @GetMapping(value = "delete/{id}")
    public String delete(@PathVariable Long id) {
        this.countryRepo.deleteById(id);
        return "country/list";
    }

}
