package com.example.projectmatrix.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping(value = "/role/")
public class RoleController {

    @GetMapping(value = "/add")
    public String viewAdd(){
        return "roles/add";
    }
    @GetMapping(value = "/edit")
    public String viewEdit(){
        return "roles/edit";
    }
    @GetMapping(value = "/list")
    public String viewList(){
        return "roles/list";
    }
}
