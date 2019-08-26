package com.example.projectmatrix.controller;

import com.example.projectmatrix.Repository.*;
import com.example.projectmatrix.entity.Car;
import com.example.projectmatrix.entity.CarPaymentSummary;
import com.example.projectmatrix.entity.City;
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
@RequestMapping(value = "/car/")
public class CarController {
    @Autowired
    private CarRepo carRepo;
    @Autowired
    private CustomerRepo customerRepo;

    @Autowired
    private CarPaySummaryRepo carPaySummaryRepo;

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
                    this.carRepo.save(car);
                    Car lastestCar = carRepo.findAll().get(carRepo.findAll().size()-1);

                    CarPaymentSummary cps  =new CarPaymentSummary();
                    cps.setCar(lastestCar);
                    cps.setTotalAmount(car.getTotalAmount());
                    cps.setPaidAmount(car.getPaidAmount());
                    double due=car.getTotalAmount()-car.getPaidAmount();
                    cps.setDueAmount(due);
                    this.carPaySummaryRepo.save(cps);

                    model.addAttribute("car", new Car());
                    model.addAttribute("cusList", this.customerRepo.findAll());
                    model.addAttribute("successMsg", "Save Successfully");
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
    @GetMapping(value = "delete/{id}")
    public String delete(@PathVariable Long id) {
        this.carRepo.deleteById(id);
        return "cars/list";
    }
//    @GetMapping(value = "list")
//    public String suviewList(Model model){
//        List<Car> list=this.carRepo.findAll();
//        model.addAttribute("list", list);
//        return "cars/list";
//    }

}
//    @GetMapping(value = "list/{id}")
//    public String carSumUpdate(Model model, @PathVariable("id") Long id){
//        model.addAttribute("CarSummaryById", this.carPaySummaryRepo.getOne(id));
//        return "carPaySummary/list";
//    }

//    public String UpdateCarSumViewById(Model model, @PathVariable("id")Long id, @RequestParam("todayAmount")double todayAmount){
//        model.addAttribute("successMsg", "Save Successfully");
//        CarPaymentSummary cps =this.carPaySummaryRepo.getOne(id);
//
//        double dueAmount = cps.getDueAmount()-todayAmount;
//        cps.setDueAmount(dueAmount);
//        Double payAmount = cps.getPaidAmount()+todayAmount;
//        cps.setPaidAmount(payAmount);
//        this.carPaySummaryRepo.save(cps);
//        model.addAttribute("CarSummaryById",this.carPaySummaryRepo.getOne(id));
//        return "carPaySummary/list";
//
//    }
