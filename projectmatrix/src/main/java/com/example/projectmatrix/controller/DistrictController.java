package com.example.projectmatrix.controller;

import com.example.projectmatrix.Repository.CountryRepo;
import com.example.projectmatrix.Repository.DistrictRepo;
import com.example.projectmatrix.Repository.DivisionRepo;
import com.example.projectmatrix.entity.District;
import com.example.projectmatrix.entity.Division;
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
@RequestMapping(value = "/dis/")
public class DistrictController {
    @Autowired
    private DivisionRepo divisionRepo;
    @Autowired
    private DistrictRepo districtRepo;

    @GetMapping(value = "add")
    public String viewAdd(Model model){
        model.addAttribute("district",new District());
        model.addAttribute("disList", this.divisionRepo.findAll());
        return "dis/add";
    }
    @PostMapping(value = "/add")
    public String addRole(@Valid District district, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            return "dis/add";
        } else {
            if (district != null) {
                District district1 = this.districtRepo.findByName(district.getName());
                if (district1 != null) {
                    model.addAttribute("existMsg", "UserName is already exist");
                } else {
                    this.districtRepo.save(district);
                    model.addAttribute("District", new District());
                    model.addAttribute("disList", this.divisionRepo.findAll());
                    model.addAttribute("successMsg", "Save Successfully");
                }
            }
        }
        return "dis/add";
    }

    @GetMapping(value = "/edit")
    public String viewEdit(){
        return "dis/edit";
    }
    @GetMapping(value = "list")
    public String viewList(Model model){
        List<District> list=this.districtRepo.findAll();
        model.addAttribute("list", list);
        return "dis/list";
    }
}
