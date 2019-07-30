package com.example.projectmatrix.controller;

import com.example.projectmatrix.Repository.RoleRepo;
import com.example.projectmatrix.Repository.UserRepo;
import com.example.projectmatrix.entity.Role;
import com.example.projectmatrix.entity.User;
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
@RequestMapping(value = "/user/")
public class UserController {
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private RoleRepo roleRepo;

    @GetMapping(value = "add")
    public String viewAdd(Model model){
        model.addAttribute("user",new User());
        model.addAttribute("roleList", this.roleRepo.findAll());
        return "users/add";
    }
    @PostMapping(value = "/add")
    public String addRole(@Valid User user, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            return "users/add";
        } else {
            if (user != null) {
                User user1 = this.userRepo.findByUserName(user.getUserName());
                if (user1 != null) {
                    model.addAttribute("existMsg", "UserName is already exist");
                } else {
                    this.userRepo.save(user);
                    model.addAttribute("user", new User());
                    model.addAttribute("roleList", this.roleRepo.findAll());
                    model.addAttribute("successMsg", "Save Successfully");
                }
            }
        }
        return "users/add";
    }

    @GetMapping(value = "/edit")
    public String viewEdit(){
        return "users/edit";
    }
    @GetMapping(value = "list")
    public String viewList(Model model){
        List<User> list=this.userRepo.findAll();
        model.addAttribute("list", list);
        return "users/list";
    }
}
