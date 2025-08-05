package com.tododuk.domain.team.service;

import com.tododuk.domain.team.entity.Team;
import com.tododuk.domain.team.entity.TeamMember;
import com.tododuk.domain.team.repository.TeamMemberRepository;
import com.tododuk.domain.team.repository.TeamRepository;
import com.tododuk.domain.team.constant.TeamRoleType;
import com.tododuk.domain.user.entity.User;
import com.tododuk.domain.user.repository.UserRepository;
import com.tododuk.global.rsData.RsData;
import com.tododuk.global.exception.ServiceException;
import com.tododuk.domain.team.dto.TeamCreateRequestDto;
import com.tododuk.domain.team.dto.TeamResponseDto;
import com.tododuk.domain.team.dto.TeamMemberResponseDto;
import com.tododuk.domain.team.dto.TeamMemberAddRequestDto;
import com.tododuk.domain.team.dto.TeamMemberUpdateRequestDto;
import com.tododuk.domain.team.dto.TeamUpdateRequestDto;
import com.tododuk.domain.team.entity.TeamTodo;
import com.tododuk.domain.team.entity.TeamTodoList;
import com.tododuk.domain.team.repository.TeamTodoRepository;
import com.tododuk.domain.team.repository.TeamTodoListRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final TeamMemberService teamMemberService;
    private final TeamTodoRepository teamTodoRepository;
    private final TeamTodoListRepository teamTodoListRepository;

    // 1. 팀 생성
    @Transactional
    public RsData<TeamResponseDto> createTeam(TeamCreateRequestDto dto, int creatorUserId) {
        System.out.println("=== 팀 생성 시작 ===");
        System.out.println("생성자 ID: " + creatorUserId);
        
        User creatorUser = userRepository.findById(creatorUserId)
                .orElseThrow(() -> new ServiceException("404-USER_NOT_FOUND", "사용자를 찾을 수 없습니다. ID: " + creatorUserId));
        
        System.out.println("생성자 정보: " + creatorUser.getUserEmail());

        Team team = new Team();
        team.setTeamName(dto.getTeamName());
        team.setDescription(dto.getDescription());
        teamRepository.save(team);
        System.out.println("팀 생성 완료, 팀 ID: " + team.getId());
        
        TeamMember leaderMember = teamMemberService.createLeaderMember(team, creatorUser);
        System.out.println("리더 멤버 생성 완료, 멤버 ID: " + leaderMember.getId());
        
        // 멤버가 실제로 추가되었는지 확인
        boolean isMemberExists = teamMemberRepository.existsByTeam_IdAndUser_Id(team.getId(), creatorUserId);
        System.out.println("멤버 존재 확인: " + isMemberExists);
        
        return RsData.success("팀이 성공적으로 생성되었습니다.", TeamResponseDto.from(team));
    }

    // 2. 사용자가 속한 팀 목록 조회
    public RsData<List<TeamResponseDto>> getMyTeams(int userId) {
        List<Team> teams = teamRepository.findTeamsByUserId(userId);
        if (teams.isEmpty()) {
            return RsData.success("속한 팀이 없습니다.", List.of());
        }
        List<TeamResponseDto> teamResponseDtos = teams.stream()
                .map(TeamResponseDto::from)
                .collect(Collectors.toList());
        return RsData.success("팀 목록 조회 성공", teamResponseDtos);
    }

    // 사용자 ID로 팀 목록 조회 (컨트롤러에서 사용)
    public List<Team> getTeamsByUserId(int userId) {
        return teamRepository.findTeamsByUserId(userId);
    }

    // 모든 팀 목록 조회 (관리자용)
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    // 3. 특정 팀 상세 조회
    public RsData<TeamResponseDto> getTeamDetails(int teamId, int viewerUserId) {
        System.out.println("=== 팀 상세 조회 시작 ===");
        System.out.println("팀 ID: " + teamId);
        System.out.println("조회자 ID: " + viewerUserId);
        
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ServiceException("404-TEAM_NOT_FOUND", "팀을 찾을 수 없습니다. ID: " + teamId));

        boolean isMember = teamMemberRepository.existsByTeam_IdAndUser_Id(teamId, viewerUserId);
        System.out.println("멤버 여부 확인: " + isMember);
        
        if (!isMember) {
            System.out.println("멤버가 아님 - 권한 없음");
            throw new ServiceException("403-NO_PERMISSION", "해당 팀의 정보를 조회할 권한이 없습니다.");
        }

        System.out.println("멤버 확인됨 - 상세 정보 반환");
        return RsData.success("팀 상세 정보 조회 성공", TeamResponseDto.from(team));
    }

    // 4. 팀 정보 수정 (PATCH)
    @Transactional
    public RsData<TeamResponseDto> updateTeamInfo(int teamId, TeamUpdateRequestDto dto, int modifierUserId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ServiceException("404-TEAM_NOT_FOUND", "팀을 찾을 수 없습니다. ID: " + teamId));

        if (!teamMemberRepository.existsByTeam_IdAndUser_IdAndRole(teamId, modifierUserId, TeamRoleType.LEADER)) {
            throw new ServiceException("403-NO_PERMISSION", "팀 정보를 수정할 권한이 없습니다.");
        }

        team.updateTeam(dto.getTeamName(), dto.getDescription());
        teamRepository.save(team);
        return RsData.success("팀 정보가 성공적으로 수정되었습니다.", TeamResponseDto.from(team));
    }

    // 5. 팀 삭제
    @Transactional
    public RsData<Void> deleteTeam(int teamId, int deleterUserId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ServiceException("404-TEAM_NOT_FOUND", "팀을 찾을 수 없습니다. ID: " + teamId));

        if (!teamMemberRepository.existsByTeam_IdAndUser_IdAndRole(teamId, deleterUserId, TeamRoleType.LEADER)) {
            throw new ServiceException("403-NO_PERMISSION", "팀을 삭제할 권한이 없습니다.");
        }

        teamRepository.delete(team);
        return RsData.success("팀이 성공적으로 삭제되었습니다.", null);
    }

    // 6. 팀 할일 목록 조회
    public RsData<List<Map<String, Object>>> getTeamTodos(int teamId, int userId) {
        // 팀 멤버 권한 확인
        if (!teamMemberRepository.existsByTeam_IdAndUser_Id(teamId, userId)) {
            throw new ServiceException("403-NO_PERMISSION", "해당 팀의 할일 목록을 조회할 권한이 없습니다.");
        }

        // TeamTodoList 조회 또는 생성
        TeamTodoList teamTodoList = teamTodoListRepository.findByTeamIdAndUserId((long) teamId, (long) userId)
            .orElseGet(() -> {
                // 없으면 새로 생성
                User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ServiceException("404-USER_NOT_FOUND", "사용자를 찾을 수 없습니다."));
                Team team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new ServiceException("404-TEAM_NOT_FOUND", "팀을 찾을 수 없습니다."));
                
                TeamTodoList newList = TeamTodoList.builder()
                    .name(teamId == 0 ? "개인 할일 목록" : team.getTeamName() + " 할일 목록")
                    .description(teamId == 0 ? "개인적으로 관리하는 할일들" : "팀원들과 함께 관리하는 할일들")
                    .user(user)
                    .team(teamId == 0 ? null : team)
                    .build();
                
                return teamTodoListRepository.save(newList);
            });

        // DB에서 해당 TeamTodoList의 할일 목록 조회
        List<TeamTodo> teamTodos = teamTodoRepository.findByTeamTodoListIdOrderByCreateDateDesc((long) teamTodoList.getId());
        
        // Map 형태로 변환
        List<Map<String, Object>> todos = teamTodos.stream()
            .map(todo -> {
                Map<String, Object> todoMap = new HashMap<>();
                todoMap.put("id", todo.getId());
                todoMap.put("title", todo.getTitle());
                todoMap.put("description", todo.getDescription());
                todoMap.put("isCompleted", todo.isCompleted());
                todoMap.put("priority", todo.getPriority());
                todoMap.put("dueDate", todo.getDueDate());
                todoMap.put("assignedMemberId", todo.getAssignedMemberId());
                todoMap.put("type", teamId == 0 ? "personal" : "team");
                todoMap.put("createdAt", todo.getCreateDate());
                return todoMap;
            })
            .collect(Collectors.toList());

        return RsData.success("할일 목록 조회 성공", todos);
    }

    // 7. 팀 할일 추가
    @Transactional
    public RsData<Map<String, Object>> addTeamTodo(int teamId, int userId, Map<String, Object> todoRequest) {
        // 팀 멤버 권한 확인
        if (!teamMemberRepository.existsByTeam_IdAndUser_Id(teamId, userId)) {
            throw new ServiceException("403-NO_PERMISSION", "해당 팀에 할일을 추가할 권한이 없습니다.");
        }

        // assignedMemberId를 정수로 변환
        Integer assignedMemberId = null;
        Object assignedMemberIdObj = todoRequest.get("assignedMemberId");
        if (assignedMemberIdObj != null && !assignedMemberIdObj.toString().isEmpty()) {
            try {
                assignedMemberId = Integer.parseInt(assignedMemberIdObj.toString());
            } catch (NumberFormatException e) {
                throw new ServiceException("400-INVALID_ASSIGNED_MEMBER", "담당 멤버 ID가 올바르지 않습니다.");
            }
        }

        // TeamTodoList 조회 또는 생성
        TeamTodoList teamTodoList = teamTodoListRepository.findByTeamIdAndUserId((long) teamId, (long) userId)
            .orElseGet(() -> {
                // 없으면 새로 생성
                User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ServiceException("404-USER_NOT_FOUND", "사용자를 찾을 수 없습니다."));
                Team team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new ServiceException("404-TEAM_NOT_FOUND", "팀을 찾을 수 없습니다."));
                
                TeamTodoList newList = TeamTodoList.builder()
                    .name(teamId == 0 ? "개인 할일 목록" : team.getTeamName() + " 할일 목록")
                    .description(teamId == 0 ? "개인적으로 관리하는 할일들" : "팀원들과 함께 관리하는 할일들")
                    .user(user)
                    .team(teamId == 0 ? null : team)
                    .build();
                
                return teamTodoListRepository.save(newList);
            });

        // TeamTodo 엔티티 생성
        TeamTodo teamTodo = TeamTodo.builder()
            .title((String) todoRequest.get("title"))
            .description((String) todoRequest.get("description"))
            .isCompleted(false)
            .priority((Integer) todoRequest.getOrDefault("priority", 1))
            .dueDate(todoRequest.get("dueDate") != null ? 
                LocalDateTime.parse(((String) todoRequest.get("dueDate")).replace("Z", "")) : null)
            .assignedMemberId(assignedMemberId)
            .teamTodoList(teamTodoList)
            .build();

        // DB에 저장
        TeamTodo savedTodo = teamTodoRepository.save(teamTodo);

        // Map 형태로 변환하여 반환
        Map<String, Object> newTodo = new HashMap<>();
        newTodo.put("id", savedTodo.getId());
        newTodo.put("title", savedTodo.getTitle());
        newTodo.put("description", savedTodo.getDescription());
        newTodo.put("isCompleted", savedTodo.isCompleted());
        newTodo.put("priority", savedTodo.getPriority());
        newTodo.put("dueDate", savedTodo.getDueDate());
        newTodo.put("assignedMemberId", savedTodo.getAssignedMemberId());
        newTodo.put("type", savedTodo.getType());
        newTodo.put("createdAt", savedTodo.getCreateDate());

        return RsData.success("할일 추가 성공", newTodo);
    }
}