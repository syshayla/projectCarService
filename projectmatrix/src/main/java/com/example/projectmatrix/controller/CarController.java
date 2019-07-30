package com.example.projectmatrix.controller;

import com.example.projectmatrix.Repository.CarRepo;
import com.example.projectmatrix.Repository.CityRepo;
import com.example.projectmatrix.Repository.CustomerRepo;
import com.example.projectmatrix.Repository.DistrictRepo;
import com.example.projectmatrix.entity.Car;
import com.example.projectmatrix.entity.City;
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
@RequestMapping(value = "/car/")
public class CarController {
    @Autowired
    private CarRepo carRepo;
    @Autowired
    private CustomerRepo customerRepo;

    @GetMapping(value = "add")
    public String viewAdd(Model model){
        model.addAttribute("car",new Car());
        model.addAttribute("cusList", this.customerRepo.findAll());
        return "cars/add";
    }
    @PostMapping(value = "/add")
    public String addRole(@Valid Car car, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            return "cars/add";
        } else {
            if (car != null) {
                Car car1 = this.carRepo.findByCarModel(car.getCarModel());
                if (car1 != null) {
                    model.addAttribute("existMsg", "CarName is already exist");
                } else {
                    this.carRepo.save(car);
                    model.addAttribute("car", new Car());
                    model.addAttribute("cusList", this.customerRepo.findAll());
                    model.addAttribute("successMsg", "Save Successfully");
                }
            }
        }
        return "cars/add";
    }

    @GetMapping(value = "/edit")
    public String viewEdit(){
        return "cars/edit";
    }
    @GetMapping(value = "list")
    public String viewList(Model model){
        List<Car> list=this.carRepo.findAll();
        model.addAttribute("list", list);
        return "cars/list";
    }
}
