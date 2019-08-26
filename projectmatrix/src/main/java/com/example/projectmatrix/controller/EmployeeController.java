package com.example.projectmatrix.controller;

import com.example.projectmatrix.Repository.CompanyRepo;
import com.example.projectmatrix.Repository.EmployeeRepo;
import com.example.projectmatrix.Repository.RoleRepo;
import com.example.projectmatrix.Repository.UserRepo;
import com.example.projectmatrix.entity.Employee;
import com.example.projectmatrix.entity.Role;
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
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Controller
@RequestMapping(value = "/emp/")
public class EmployeeController {
    @Autowired
    private EmployeeRepo employeeRepo;
    @Autowired
    private CompanyRepo companyRepo;
    @Autowired
    private UserRepo userRepo;

    @Autowired
    private RoleRepo roleRepo;

    @GetMapping(value = "add")
    public String viewAdd(Model model){
        model.addAttribute("employee",new Employee());
        model.addAttribute("companyList", this.companyRepo.findAll());
        return "employees/add";
    }
    @PostMapping(value = "/add")
    public String addRole(@Valid Employee employee, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            return "employees/add";
        } else {
            if (employee != null) {
                Employee user1 = this.employeeRepo.findByName(employee.getName());
                if (user1 != null) {
                    model.addAttribute("existMsg", "EmployeeName is already exist");
                } else {
                Role role =roleRepo.findByRoleName("EMPLOYEE");
                    Set<Role> roles = new HashSet<>();
                    roles.add(role);

                    User user =new User(employee.getName(), employee.getEmail(), "123456", employee.getEmail(), roles);
                    this.userRepo.save(user);

                    User user2 =this.userRepo.findByUserName(user.getUserName());
                    employee.setUser(user2);

                    this.employeeRepo.save(employee);
                    model.addAttribute("employee", new Employee());
                    model.addAttribute("companyList", this.companyRepo.findAll());
                    model.addAttribute("successMsg", "Save Successfully");
                }
            }
        }
        return "employees/add";
    }

    @GetMapping(value = "/edit")
    public String viewEdit(){
        return "employees/edit";
    }

    @GetMapping(value = "list")
    public String viewList(Model model){
        List<Employee> list=this.employeeRepo.findAll();
        model.addAttribute("list", list);
        return "employees/list";
    }
    @GetMapping(value = "delete/{id}")
    public String delete(@PathVariable Long id) {
        this.employeeRepo.deleteById(id);
        return "employees/list";
    }
}
