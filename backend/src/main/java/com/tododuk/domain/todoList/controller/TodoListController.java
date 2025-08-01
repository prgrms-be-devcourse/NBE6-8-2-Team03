package com.tododuk.domain.todoList.controller;

import com.tododuk.domain.todoList.service.TodoListService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/todo-lists")
@Tag(name = "todoLists")
@CrossOrigin(origins = "http://localhost:3000")
public class TodoListController {

    private TodoListService todoListService;
}
