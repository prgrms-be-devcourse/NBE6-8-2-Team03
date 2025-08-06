package com.tododuk.global.initData;

import com.tododuk.domain.label.entity.Label;
import com.tododuk.domain.label.service.LabelService;
import com.tododuk.domain.team.entity.Team;
import com.tododuk.domain.team.entity.TeamMember;
import com.tododuk.domain.team.repository.TeamMemberRepository;
import com.tododuk.domain.team.repository.TeamRepository;
import com.tododuk.domain.team.service.TeamService;
import com.tododuk.domain.todo.entity.Todo;
import com.tododuk.domain.todo.repository.TodoRepository;
import com.tododuk.domain.todoLabel.entity.TodoLabel;
import com.tododuk.domain.todoLabel.repository.TodoLabelRepository;
import com.tododuk.domain.todoLabel.service.TodoLabelService;
import com.tododuk.domain.user.entity.User;
import com.tododuk.domain.user.repository.UserRepository;
import com.tododuk.domain.team.constant.TeamRoleType;
import com.tododuk.domain.todoList.entity.TodoList;
import com.tododuk.domain.todoList.repository.TodoListRepository;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final PasswordEncoder passwordEncoder;
    private final TodoListRepository todoListRepository;
    private final TeamService teamService;


    @PostConstruct
    public void init(){
        System.out.println("초기데이터 입력");
        if(!teamRepository.findById(1).isPresent()) {
            // 팀 생성
            Team team1 = new Team();
            team1.setTeamName("개인 구별용");
            team1.setDescription("이 팀은 개인 리스트에 붙는 팀 입니다");
            System.out.println("개인 구별용 팀 생성 성공");
        } else if (!teamRepository.findById(1).get().getTeamName().equals("개인 구별용")) {
            System.out.println("1번 팀이 개인 구별용이 아닙니다. 확인해주세요.");

        }

        if(labelService.countLabels() ==0){


            //label 생성
            Label label1 = labelService.createLabelIfNotExists("공부", "#FF4D4F"); // 빨강
            Label label2 = labelService.createLabelIfNotExists("운동", "#1890FF"); // 파랑
            Label label3 = labelService.createLabelIfNotExists("휴식", "#52C41A"); // 초록


            labelService.createLabel(label1);
            labelService.createLabel(label2);
            labelService.createLabel(label3);



        } else{
            System.out.println("초기 데이터가 이미 존재합니다.");
        }
    }
}
