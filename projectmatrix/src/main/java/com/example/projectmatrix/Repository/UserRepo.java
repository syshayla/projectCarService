package com.example.projectmatrix.Repository;

import com.example.projectmatrix.entity.Role;
import com.example.projectmatrix.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {
    User findByUserName(String username);
    Optional<User> findByUserNameOrEmail(String userName, String email);
}
