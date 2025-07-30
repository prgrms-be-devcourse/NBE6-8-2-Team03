package com.tododuk.domain.user.service;

import com.tododuk.domain.user.dto.UserDto;
import com.tododuk.domain.user.entity.User;
import com.tododuk.domain.user.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final AuthTokenService authTokenService;

    public Optional<User> findById(int id) {
        return userRepository.findById(id);
    }

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

    public void updateUserInfo(User user, UserDto reqBody) {
        user.updateUserInfo(
                reqBody.nickname(),
                reqBody.profileImageUrl()
        );
    }

    public String genAccessToken(User user) {
        return authTokenService.genAccessToken(user);
    }

    public Map<String, Object> payload(String accessToken) {
        return  authTokenService.payload(accessToken);
    }

}
