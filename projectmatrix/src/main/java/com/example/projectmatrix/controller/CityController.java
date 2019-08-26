package com.example.projectmatrix.controller;

import com.example.projectmatrix.Repository.CityRepo;
import com.example.projectmatrix.Repository.DistrictRepo;
import com.example.projectmatrix.Repository.RoleRepo;
import com.example.projectmatrix.Repository.UserRepo;
import com.example.projectmatrix.entity.City;
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
@RequestMapping(value = "/city/")
public class CityController {
    @Autowired
    private CityRepo cityRepo;
    @Autowired
    private DistrictRepo disRepo;

    @GetMapping(value = "add")
    public String viewAdd(Model model){
        model.addAttribute("City",new City());
        model.addAttribute("DisList", this.disRepo.findAll());
        return "city/add";
    }
    @PostMapping(value = "/add")
    public String addRole(@Valid City city, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            return "city/add";
        } else {
            if (city != null) {
                City city1 = this.cityRepo.findByName(city.getName());
                if (city1 != null) {
                    model.addAttribute("existMsg", "UserName is already exist");
                } else {
                    this.cityRepo.save(city);
                    model.addAttribute("City", new City());
                    model.addAttribute("successMsg", "Save Successfully");
                }
            }
        }
        return "city/add";
    }

    @GetMapping(value = "/edit")
    public String viewEdit(){
        return "city/edit";
    }
    @GetMapping(value = "list")
    public String viewList(Model model){
        List<City> list=this.cityRepo.findAll();
        model.addAttribute("list", list);
        return "city/list";
    }
    @GetMapping(value = "delete/{id}")
    public String delete(@PathVariable Long id) {
        this.cityRepo.deleteById(id);
        return "city/list";
    }

}
