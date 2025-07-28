package com.tododuk.domain.user.service;

import com.tododuk.domain.user.entity.User;
import com.tododuk.domain.user.repository.UserRepository;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public Optional<User> findByUserEmail(String email) {
        return userRepository.findByUserEmail(email);
    }

    public User join(String email,String password, String nickname) {
        User user = new User(email, password, nickname);
        return userRepository.save(user);
    }

    public Optional<User> findByApiKey(String apiKey) {
        return userRepository.findByApiKey(apiKey);
    }
}
