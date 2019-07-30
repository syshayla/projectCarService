package com.example.projectmatrix.controller;

import com.example.projectmatrix.Repository.RoleRepo;
import com.example.projectmatrix.entity.Role;
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
@RequestMapping(value = "/role/")
public class RoleController {
    @Autowired
    private RoleRepo roleRepo;

    @GetMapping(value = "add")
    public String viewAdd(Model model){
        model.addAttribute("role",new Role());
        return "roles/add";
    }
    @PostMapping(value = "/add")
    public String addRole(@Valid Role role, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            return "roles/add";
        } else {
            if (role != null) {
                Role role1 = this.roleRepo.findByRoleName(role.getRoleName());
                if (role1 != null) {
                    model.addAttribute("existMsg", "RoleName is already exist");
                } else {
                    this.roleRepo.save(role);
                    model.addAttribute("role", new Role());
                    model.addAttribute("successMsg", "Save Successfully");
                }
            }
        }
        return "roles/add";
    }

    @GetMapping(value = "/edit")
    public String viewEdit(){
        return "roles/edit";
    }
    @GetMapping(value = "list")
    public String viewList(Model model){
        List<Role> list=this.roleRepo.findAll();
        model.addAttribute("list", list);
        return "roles/list";
    }
}
