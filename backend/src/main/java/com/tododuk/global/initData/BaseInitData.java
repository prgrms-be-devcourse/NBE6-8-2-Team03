package com.tododuk.global.initData;

import com.tododuk.domain.label.entity.Label;
import com.tododuk.domain.label.service.LabelService;
import com.tododuk.domain.todo.entity.Todo;
import com.tododuk.domain.todo.repository.TodoRepository;
import com.tododuk.domain.todoLabel.entity.TodoLabel;
import com.tododuk.domain.todoLabel.repository.TodoLabelRepository;
import com.tododuk.domain.todoLabel.service.TodoLabelService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@RequiredArgsConstructor
@Transactional
@Configuration
public class BaseInitData {

    private final LabelService labelService;
    private final TodoLabelService todoLabelService;
    private final TodoLabelRepository todoLabelRepository;

    @PostConstruct
    public void init(){
        System.out.println("초기데이터 입력");

        if(labelService.countLabels() ==0){
            //label 생성
            Label label1 = labelService.createLabel(Label.builder().name("공부").color("빨강").build());
            Label label2 = labelService.createLabel(Label.builder().name("운동").color("파랑").build());
            Label label3 = labelService.createLabel(Label.builder().name("약먹기").color("주황").build());

            //todo 생성
            Todo todo1 = Todo.builder()
                    .title("자바 공부하기")
                    .description("백엔드 부트캠프 주차별 과제 수행")
                    .isCompleted(false)
                    .priority(3) // High
                    .startDate(LocalDateTime.of(2025, 7, 28, 9, 0))
                    .dueDate(LocalDateTime.of(2025, 8, 1, 18, 0))
                    .build();

            Todo todo2 = Todo.builder()
                    .title("운동하기")
                    .description("헬스장 가서 1시간 운동")
                    .isCompleted(false)
                    .priority(2) // Medium
                    .startDate(LocalDateTime.of(2025, 7, 29, 7, 0))
                    .dueDate(LocalDateTime.of(2025, 7, 29, 8, 0))
                    .build();

            //todoLabel 생성
            TodoLabel todoLabel1 = TodoLabel.builder().todo(todo1).label(label1).build();
            TodoLabel todoLabel2 = TodoLabel.builder().todo(todo1).label(label2).build();
            TodoLabel todoLabel3 = TodoLabel.builder().todo(todo2).label(label1).build();

            todoRepository.save(todo1);
            todoRepository.save(todo2);
            labelService.createLabel(label1);
            labelService.createLabel(label2);
            labelService.createLabel(label3);
            todoLabelRepository.save(todoLabel1);
            todoLabelRepository.save(todoLabel2);
            todoLabelRepository.save(todoLabel3);
        } else{
            System.out.println("초기 데이터가 이미 존재합니다.");
        }
    }

    private final TodoRepository todoRepository;
}
