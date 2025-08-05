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
import com.tododuk.domain.todo.entity.Todo;
import com.tododuk.domain.todo.repository.TodoRepository;
import com.tododuk.domain.todoList.entity.TodoList;
import com.tododuk.domain.todoList.repository.TodoListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final TodoRepository todoRepository;
    private final TodoListRepository todoListRepository;
    private final TeamMemberService teamMemberService;

    // 1. 팀 생성
    @Transactional
    public RsData<TeamResponseDto> createTeam(TeamCreateRequestDto dto, int creatorUserId) {
        System.out.println("=== 팀 생성 시작 ===");
        System.out.println("생성자 ID: " + creatorUserId);
        
        User creatorUser = userRepository.findById(creatorUserId)
                .orElseThrow(() -> new ServiceException("404-USER_NOT_FOUND", "사용자를 찾을 수 없습니다. ID: " + creatorUserId));
        
        System.out.println("생성자 정보: " + creatorUser.getUserEmail());

        Team team = Team.builder()
                .teamName(dto.getTeamName())
                .description(dto.getDescription())
                .build();
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
        // teamId가 0이면 개인 투두리스트, 1 이상이면 팀 투두리스트
        if (teamId == 0) {
            // 개인 할일 목록 조회
            List<Todo> personalTodos = todoRepository.findByAssignedMemberId(userId);
            List<Map<String, Object>> todoMaps = personalTodos.stream()
                .map(todo -> {
                    Map<String, Object> todoMap = new HashMap<>();
                    todoMap.put("id", todo.getId());
                    todoMap.put("title", todo.getTitle());
                    todoMap.put("description", todo.getDescription());
                    todoMap.put("isCompleted", todo.isCompleted());
                    todoMap.put("priority", todo.getPriority());
                    todoMap.put("dueDate", todo.getDueDate());
                    todoMap.put("assignedMemberId", userId);
                    todoMap.put("type", "personal");
                    return todoMap;
                })
                .collect(Collectors.toList());
            
            return RsData.success("개인 할일 목록 조회 성공", todoMaps);
        } else {
            // 팀 투두리스트 조회 - 팀 멤버 확인
            if (!teamMemberRepository.existsByTeam_IdAndUser_Id(teamId, userId)) {
                throw new ServiceException("403-NO_PERMISSION", "해당 팀의 할일 목록을 조회할 권한이 없습니다.");
            }

            // 팀의 할일 목록 조회
            List<Todo> teamTodos = todoRepository.findByTodoList_Team_Id(teamId);
            List<Map<String, Object>> todoMaps = teamTodos.stream()
                .map(todo -> {
                    Map<String, Object> todoMap = new HashMap<>();
                    todoMap.put("id", todo.getId());
                    todoMap.put("title", todo.getTitle());
                    todoMap.put("description", todo.getDescription());
                    todoMap.put("isCompleted", todo.isCompleted());
                    todoMap.put("priority", todo.getPriority());
                    todoMap.put("dueDate", todo.getDueDate());
                    todoMap.put("assignedMemberId", todo.getAssignedMemberId());
                    todoMap.put("type", "team");
                    return todoMap;
                })
                .collect(Collectors.toList());

            return RsData.success("팀 할일 목록 조회 성공", todoMaps);
        }
    }

    // 7. 팀 할일 추가
    @Transactional
    public RsData<Map<String, Object>> addTeamTodo(int teamId, int userId, Map<String, Object> todoRequest) {
        // teamId가 0이면 개인 투두리스트, 1 이상이면 팀 투두리스트
        if (teamId == 0) {
            // 개인 할일 추가 - 권한 확인 불필요 (자신의 할일)
            Todo newTodo = new Todo();
            newTodo.setTitle((String) todoRequest.get("title"));
            newTodo.setDescription((String) todoRequest.get("description"));
            newTodo.setIsCompleted(false);
            newTodo.setPriority((Integer) todoRequest.getOrDefault("priority", 1));
            newTodo.setDueDate(todoRequest.get("dueDate") != null ? 
                LocalDateTime.parse(((String) todoRequest.get("dueDate")).replace("Z", "")) : null);
            newTodo.setAssignedMemberId(userId);
            newTodo.setStartDate(LocalDateTime.now());
            
            // 개인 할일 목록 찾기 또는 생성
            TodoList personalTodoList = todoListRepository.findByUserIdAndTeamIdIsNull(userId)
                .orElseGet(() -> {
                    TodoList newList = new TodoList();
                    newList.setName("개인 할일 목록");
                    newList.setDescription("개인적으로 관리하는 할일 목록");
                    newList.setUserId(userId);
                    newList.setTeamId(null);
                    return todoListRepository.save(newList);
                });
            
            newTodo.setTodoList(personalTodoList);
            Todo savedTodo = todoRepository.save(newTodo);
            
            Map<String, Object> result = new HashMap<>();
            result.put("id", savedTodo.getId());
            result.put("title", savedTodo.getTitle());
            result.put("description", savedTodo.getDescription());
            result.put("isCompleted", savedTodo.isCompleted());
            result.put("priority", savedTodo.getPriority());
            result.put("dueDate", savedTodo.getDueDate());
            result.put("assignedMemberId", savedTodo.getAssignedMemberId());
            result.put("type", "personal");
            result.put("createdAt", savedTodo.getCreateDate());

            return RsData.success("개인 할일 추가 성공", result);
        } else {
            // 팀 할일 추가 - 팀 멤버 확인
            if (!teamMemberRepository.existsByTeam_IdAndUser_Id(teamId, userId)) {
                throw new ServiceException("403-NO_PERMISSION", "해당 팀에 할일을 추가할 권한이 없습니다.");
            }

            // 팀 할일 목록 찾기 또는 생성
            TodoList teamTodoList = todoListRepository.findByTeamId(teamId)
                .orElseGet(() -> {
                    TodoList newList = new TodoList();
                    newList.setName("팀 할일 목록");
                    newList.setDescription("팀원들과 함께 관리하는 할일 목록");
                    newList.setUserId(userId);
                    newList.setTeamId(teamId);
                    return todoListRepository.save(newList);
                });

            // 팀 할일 생성
            Todo newTodo = new Todo();
            newTodo.setTitle((String) todoRequest.get("title"));
            newTodo.setDescription((String) todoRequest.get("description"));
            newTodo.setIsCompleted(false);
            newTodo.setPriority((Integer) todoRequest.getOrDefault("priority", 1));
            newTodo.setDueDate(todoRequest.get("dueDate") != null ? 
                LocalDateTime.parse(((String) todoRequest.get("dueDate")).replace("Z", "")) : null);
            newTodo.setAssignedMemberId((Integer) todoRequest.get("assignedMemberId"));
            newTodo.setStartDate(LocalDateTime.now());
            newTodo.setTodoList(teamTodoList);
            
            Todo savedTodo = todoRepository.save(newTodo);
            
            Map<String, Object> result = new HashMap<>();
            result.put("id", savedTodo.getId());
            result.put("title", savedTodo.getTitle());
            result.put("description", savedTodo.getDescription());
            result.put("isCompleted", savedTodo.isCompleted());
            result.put("priority", savedTodo.getPriority());
            result.put("dueDate", savedTodo.getDueDate());
            result.put("assignedMemberId", savedTodo.getAssignedMemberId());
            result.put("type", "team");
            result.put("createdAt", savedTodo.getCreateDate());

            return RsData.success("팀 할일 추가 성공", result);
        }
    }
}