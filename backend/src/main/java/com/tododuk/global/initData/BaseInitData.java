package com.tododuk.global.initData;

import com.tododuk.domain.label.entity.Label;
import com.tododuk.domain.label.service.LabelService;
import com.tododuk.domain.team.entity.Team;
import com.tododuk.domain.team.entity.TeamMember;
import com.tododuk.domain.team.repository.TeamMemberRepository;
import com.tododuk.domain.team.repository.TeamRepository;
import com.tododuk.domain.todo.entity.Todo;
import com.tododuk.domain.todo.repository.TodoRepository;
import com.tododuk.domain.todoLabel.entity.TodoLabel;
import com.tododuk.domain.todoLabel.repository.TodoLabelRepository;
import com.tododuk.domain.todoLabel.service.TodoLabelService;
import com.tododuk.domain.user.entity.User;
import com.tododuk.domain.user.repository.UserRepository;
import com.tododuk.domain.team.constant.TeamRoleType;
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
    private final TodoRepository todoRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;

    @PostConstruct
    public void init(){
        System.out.println("초기데이터 입력");

        if(labelService.countLabels() ==0){
            // 사용자 생성
            User user1 = User.builder()
                    .nickname("김개발")
                    .email("dev@test.com")
                    .password("password123")
                    .build();
            
            User user2 = User.builder()
                    .nickname("이코딩")
                    .email("coding@test.com")
                    .password("password123")
                    .build();
            
            User user3 = User.builder()
                    .nickname("박서버")
                    .email("server@test.com")
                    .password("password123")
                    .build();

            userRepository.save(user1);
            userRepository.save(user2);
            userRepository.save(user3);

            // 팀 생성
            Team team1 = Team.builder()
                    .teamName("프론트엔드 개발팀")
                    .description("React, Next.js를 활용한 웹 프론트엔드 개발팀")
                    .build();
            
            Team team2 = Team.builder()
                    .teamName("백엔드 개발팀")
                    .description("Spring Boot, JPA를 활용한 백엔드 개발팀")
                    .build();

            teamRepository.save(team1);
            teamRepository.save(team2);

            // 팀 멤버 추가
            TeamMember member1 = TeamMember.builder()
                    .user(user1)
                    .team(team1)
                    .role(TeamRoleType.LEADER)
                    .build();
            
            TeamMember member2 = TeamMember.builder()
                    .user(user2)
                    .team(team1)
                    .role(TeamRoleType.MEMBER)
                    .build();
            
            TeamMember member3 = TeamMember.builder()
                    .user(user3)
                    .team(team2)
                    .role(TeamRoleType.LEADER)
                    .build();
            
            TeamMember member4 = TeamMember.builder()
                    .user(user1)
                    .team(team2)
                    .role(TeamRoleType.MEMBER)
                    .build();

            teamMemberRepository.save(member1);
            teamMemberRepository.save(member2);
            teamMemberRepository.save(member3);
            teamMemberRepository.save(member4);

            //label 생성
            Label label1 = labelService.createLabelIfNotExists("공부", "#FF4D4F"); // 빨강
            Label label2 = labelService.createLabelIfNotExists("운동", "#1890FF"); // 파랑
            Label label3 = labelService.createLabelIfNotExists("휴식", "#52C41A"); // 초록

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
}
