package com.tododuk.domain.user.controller;

import com.tododuk.domain.user.entity.User;
import com.tododuk.domain.user.service.UserService;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class UserControllerTest {
    @Autowired
    private UserService UserService;
    @Autowired
    private MockMvc mvc;
    @Autowired
    private UserService userService;

    @Test
    @DisplayName("회원가입")
    void t1() throws Exception {
        ResultActions resultActions = mvc
                .perform(
                        post("/api/v1/user")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                            "email": "usernew@gmail.com",
                                            "password": "1234",
                                            "nickname": "무명"
                                        }
                                        """.stripIndent())
                )
                .andDo(print());

        User user = userService.findByUserEmail("usernew@gmail.com").get();

        resultActions
                .andExpect(handler().handlerType(UserController.class))
                .andExpect(handler().methodName("join"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.resultCode").value("200-1"))
                .andExpect(jsonPath("$.msg").value("%s님 환영합니다. 회원가입이 완료되었습니다.".formatted(user.getNickName())))
                .andExpect(jsonPath("$.data").exists())
                .andExpect(jsonPath("$.data.id").value(user.getId()))
                .andExpect(jsonPath("$.data.createDate").value(Matchers.startsWith(user.getCreateDate().toString().substring(0, 20))))
                .andExpect(jsonPath("$.data.modifyDate").value(Matchers.startsWith(user.getModifyDate().toString().substring(0, 20))))
                .andExpect(jsonPath("$.data.email").value(user.getUserEmail()));
    }
}
