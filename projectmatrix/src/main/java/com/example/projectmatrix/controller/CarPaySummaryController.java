package com.example.projectmatrix.controller;

import com.example.projectmatrix.Repository.CarPaySummaryRepo;
import com.example.projectmatrix.Repository.ProductSummaryRepo;
import com.example.projectmatrix.entity.CarPaymentSummary;
import com.example.projectmatrix.entity.ProductSummary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping(value = "/carsum/")
public class CarPaySummaryController {
    @Autowired
    private CarPaySummaryRepo carPaySummaryRepo;




    @GetMapping(value = "list")
    public String viewList(Model model){
        List<CarPaymentSummary> list=this.carPaySummaryRepo.findAll();
        model.addAttribute("list", list);
        return "carPaySummary/list";
    }

    @GetMapping(value = "summaryupdate/{id}")
    public String carSumUpdate(Model model, @PathVariable("id") Long id){
        CarPaymentSummary carPaymentSummary = this.carPaySummaryRepo.getOne(id);
        model.addAttribute("carSummaryById", carPaymentSummary);
        return "carPaySummary/update";
    }
    @PostMapping(value = "/summaryupdate/{id}")
    public String UpdateCarSumViewById(Model model, @PathVariable("id") Long id, @RequestParam("todayAmount") double todayAmount){
        model.addAttribute("successMsg", "Save Successfully");
        CarPaymentSummary cps =this.carPaySummaryRepo.getOne(id);

        double dueAmount = cps.getDueAmount() - todayAmount;
        cps.setDueAmount(dueAmount);
        Double payAmount = cps.getPaidAmount() + todayAmount;
        cps.setPaidAmount(payAmount);
        this.carPaySummaryRepo.save(cps);
        model.addAttribute("carSummaryById",this.carPaySummaryRepo.getOne(id));
        return "carPaySummary/update";

    }
}
