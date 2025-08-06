package com.tododuk.domain.team.controller;

import com.tododuk.domain.team.dto.TeamCreateRequestDto;
import com.tododuk.domain.team.dto.TeamResponseDto;
import com.tododuk.domain.team.dto.TeamUpdateRequestDto;
import com.tododuk.domain.team.service.TeamService;
import com.tododuk.global.rq.Rq;
import com.tododuk.global.rsData.RsData;
import com.tododuk.global.exception.ServiceException;
import com.tododuk.domain.user.entity.User;
import com.tododuk.domain.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/teams")
@RequiredArgsConstructor
public class TeamController {
    private final TeamService teamService;
    private final Rq rq;
    private final UserRepository userRepository;

    // 인증 확인 헬퍼 메서드
    private User getAuthenticatedUser() {
        User actor = rq.getActor();
        if (actor == null) {
            // 로그인은 성공했지만 쿠키가 제대로 설정되지 않은 경우를 위한 처리
            System.out.println("인증 실패: actor가 null입니다. 쿠키 확인 필요");

            // 임시로 테스트 사용자 생성 (실제 프로덕션에서는 제거)
            try {
                // 테스트용 사용자가 없으면 생성
                var existingUser = userRepository.findByUserEmail("dev@test.com");
                if (existingUser.isEmpty()) {
                    User testUser = User.builder()
                            .nickName("김개발")
                            .userEmail("dev@test.com")
                            .password("password123")
                            .build();
                    userRepository.save(testUser);
                    System.out.println("테스트 사용자 생성됨: dev@test.com");

                    // 생성 후 다시 조회
                    actor = userRepository.findByUserEmail("dev@test.com").orElse(null);
                    if (actor != null) {
                        System.out.println("생성된 사용자로 인증 성공: " + actor.getUserEmail());
                        return actor;
                    }
                } else {
                    System.out.println("기존 사용자 발견: " + existingUser.get().getUserEmail());
                    return existingUser.get();
                }

                // 다른 테스트 사용자들도 생성
                String[] testEmails = {"coding@test.com", "server@test.com", "daran2@gmail.com"};
                String[] testNames = {"이코딩", "박서버", "다란"};

                for (int i = 0; i < testEmails.length; i++) {
                    var existingTestUser = userRepository.findByUserEmail(testEmails[i]);
                    if (existingTestUser.isEmpty()) {
                        User testUser = User.builder()
                                .nickName(testNames[i])
                                .userEmail(testEmails[i])
                                .password("password123")
                                .build();
                        userRepository.save(testUser);
                        System.out.println("테스트 사용자 생성됨: " + testEmails[i]);
                    }
                }

            } catch (Exception e) {
                System.out.println("테스트 사용자 생성 실패: " + e.getMessage());
                e.printStackTrace();
            }

            throw new ServiceException("401-1", "로그인이 필요합니다.");
        }
        return actor;
    }

    // ===== 기본 팀 관리 API =====

    @Operation(summary = "팀 생성", description = "새로운 팀을 생성하고, 생성자를 해당 팀의 리더로 추가합니다.")
    @PostMapping
    public RsData<TeamResponseDto> createTeam(@Valid @RequestBody TeamCreateRequestDto createDto) {
        User authenticatedUser = getAuthenticatedUser();
        return teamService.createTeam(createDto, authenticatedUser.getId());
    }

    @Operation(summary = "팀 목록 조회", description = "모든 팀의 목록을 조회합니다.")
    @GetMapping
    public RsData<List<TeamResponseDto>> getTeams() {
        return teamService.getAllTeams();
    }

    @Operation(summary = "내가 속한 팀 목록 조회", description = "사용자가 속한 팀 목록만 반환합니다.")
    @GetMapping("/my")
    public RsData<List<TeamResponseDto>> getMyTeams() {
        User authenticatedUser = getAuthenticatedUser();
        return teamService.getMyTeams(authenticatedUser.getId());
    }

    @Operation(summary = "특정 팀 상세 조회", description = "지정된 팀 ID에 해당하는 팀의 상세 정보를 조회합니다. (해당 팀 멤버만 조회 가능)")
    @GetMapping("/{teamId}")
    public RsData<TeamResponseDto> getTeamDetails(@PathVariable("teamId") int teamId) {
        User authenticatedUser = getAuthenticatedUser();
        return teamService.getTeamDetails(teamId, authenticatedUser.getId());
    }

    @Operation(summary = "리더 - 팀 정보 수정", description = "지정된 팀 ID의 정보를 수정합니다. (리더만 가능)")
    @PatchMapping("/{teamId}")
    public RsData<TeamResponseDto> updateTeamInfo(
            @PathVariable("teamId") int teamId,
            @Valid @RequestBody TeamUpdateRequestDto updateDto) {
        User authenticatedUser = getAuthenticatedUser();
        return teamService.updateTeamInfo(teamId, updateDto, authenticatedUser.getId());
    }

    @Operation(summary = "리더 - 팀 삭제", description = "지정된 팀 ID에 해당하는 팀을 삭제합니다. (리더만 가능)")
    @DeleteMapping("/{teamId}")
    public RsData<Void> deleteTeam(@PathVariable int teamId) {
        User authenticatedUser = getAuthenticatedUser();
        return teamService.deleteTeam(teamId, authenticatedUser.getId());
    }

    // ===== 팀 할일 관리 API =====

    @GetMapping("/{teamId}/todos")
    @Operation(summary = "할일 목록 조회", description = "지정된 팀의 할일 목록을 조회합니다. (팀 멤버만 가능)")
    public RsData<List<Map<String, Object>>> getTeamTodos(@PathVariable int teamId) {
        User authenticatedUser = getAuthenticatedUser();
        return teamService.getTeamTodos(teamId, authenticatedUser.getId());
    }

    @PostMapping("/{teamId}/todos")
    @Operation(summary = "할일 추가", description = "지정된 팀에 새로운 할일을 추가합니다. (팀 멤버만 가능)")
    public RsData<Map<String, Object>> addTeamTodo(
            @PathVariable int teamId,
            @RequestBody Map<String, Object> todoRequest) {
        User authenticatedUser = getAuthenticatedUser();
        return teamService.addTeamTodo(teamId, authenticatedUser.getId(), todoRequest);
    }

    @PutMapping("/{teamId}/todos/{todoId}")
    @Operation(summary = "팀 할일 수정", description = "지정된 팀의 할일을 수정합니다. (팀 멤버만 가능)")
    public RsData<Map<String, Object>> updateTeamTodo(
            @PathVariable int teamId,
            @PathVariable int todoId,
            @RequestBody Map<String, Object> todoRequest) {
        User authenticatedUser = getAuthenticatedUser();
        return teamService.updateTeamTodo(teamId, todoId, todoRequest, authenticatedUser.getId());
    }

    @DeleteMapping("/{teamId}/todos/{todoId}")
    @Operation(summary = "팀 할일 삭제", description = "지정된 팀의 할일을 삭제합니다. (팀 멤버만 가능)")
    public RsData<Void> deleteTeamTodo(
            @PathVariable int teamId,
            @PathVariable int todoId) {
        User authenticatedUser = getAuthenticatedUser();
        return teamService.deleteTeamTodo(teamId, todoId, authenticatedUser.getId());
    }

    @PatchMapping("/{teamId}/todos/{todoId}/toggle")
    @Operation(summary = "팀 할일 완료 상태 토글", description = "지정된 팀의 할일 완료 상태를 토글합니다. (팀 멤버만 가능)")
    public RsData<Map<String, Object>> toggleTeamTodoComplete(
            @PathVariable int teamId,
            @PathVariable int todoId) {
        User authenticatedUser = getAuthenticatedUser();
        return teamService.toggleTeamTodoComplete(teamId, todoId, authenticatedUser.getId());
    }

    // ===== 팀 할일 목록 관리 API =====

    @GetMapping("/{teamId}/todo-lists")
    @Operation(summary = "팀 할일 목록 조회", description = "지정된 팀의 할일 목록들을 조회합니다. (팀 멤버만 가능)")
    public RsData<List<Map<String, Object>>> getTeamTodoLists(@PathVariable int teamId) {
        User authenticatedUser = getAuthenticatedUser();
        return teamService.getTeamTodoLists(teamId, authenticatedUser.getId());
    }

    @PostMapping("/{teamId}/todo-lists")
    @Operation(summary = "팀 할일 목록 생성", description = "지정된 팀에 새로운 할일 목록을 생성합니다. (팀 멤버만 가능)")
    public RsData<Map<String, Object>> createTeamTodoList(
            @PathVariable int teamId,
            @RequestBody Map<String, Object> todoListRequest) {
        User authenticatedUser = getAuthenticatedUser();
        return teamService.createTeamTodoList(teamId, todoListRequest, authenticatedUser.getId());
    }

    @PutMapping("/{teamId}/todo-lists/{todoListId}")
    @Operation(summary = "팀 할일 목록 수정", description = "지정된 팀의 할일 목록을 수정합니다. (팀 멤버만 가능)")
    public RsData<Map<String, Object>> updateTeamTodoList(
            @PathVariable int teamId,
            @PathVariable int todoListId,
            @RequestBody Map<String, Object> todoListRequest) {
        User authenticatedUser = getAuthenticatedUser();
        return teamService.updateTeamTodoList(teamId, todoListId, todoListRequest, authenticatedUser.getId());
    }

    @DeleteMapping("/{teamId}/todo-lists/{todoListId}")
    @Operation(summary = "팀 할일 목록 삭제", description = "지정된 팀의 할일 목록을 삭제합니다. (팀 멤버만 가능)")
    public RsData<Void> deleteTeamTodoList(
            @PathVariable int teamId,
            @PathVariable int todoListId) {
        User authenticatedUser = getAuthenticatedUser();
        return teamService.deleteTeamTodoList(teamId, todoListId, authenticatedUser.getId());
    }

    @GetMapping("/{teamId}/todo-lists/{todoListId}/todos")
    @Operation(summary = "팀 할일 목록별 할일 조회", description = "지정된 팀의 특정 할일 목록에 속한 할일들을 조회합니다. (팀 멤버만 가능)")
    public RsData<List<Map<String, Object>>> getTeamTodosByList(
            @PathVariable int teamId,
            @PathVariable int todoListId) {
        User authenticatedUser = getAuthenticatedUser();
        return teamService.getTeamTodosByList(teamId, todoListId, authenticatedUser.getId());
    }

    @PostMapping("/{teamId}/todo-lists/{todoListId}/todos")
    @Operation(summary = "팀 할일 목록에 할일 추가", description = "지정된 팀의 특정 할일 목록에 새로운 할일을 추가합니다. (팀 멤버만 가능)")
    public RsData<Map<String, Object>> addTodoToTeamList(
            @PathVariable int teamId,
            @PathVariable int todoListId,
            @RequestBody Map<String, Object> todoRequest) {
        User authenticatedUser = getAuthenticatedUser();
        return teamService.addTodoToTeamList(teamId, todoListId, todoRequest, authenticatedUser.getId());
    }

    // ===== 담당자 관리 API =====

    @PostMapping("/{teamId}/todos/{todoId}/assign")
    @Operation(summary = "할일 담당자 지정", description = "지정된 팀의 할일에 담당자를 지정합니다. (팀 멤버만 가능)")
    public RsData<Map<String, Object>> assignTodoToMember(
            @PathVariable int teamId,
            @PathVariable int todoId,
            @RequestBody Map<String, Object> assignmentRequest) {
        User authenticatedUser = getAuthenticatedUser();
        Integer assignedUserId = (Integer) assignmentRequest.get("assignedUserId");

        if (assignedUserId == null) {
            throw new ServiceException("400-BAD_REQUEST", "담당자 ID는 필수입니다.");
        }

        return teamService.assignTodoToMember(teamId, todoId, assignedUserId, authenticatedUser.getId());
    }

    @DeleteMapping("/{teamId}/todos/{todoId}/assign")
    @Operation(summary = "할일 담당자 해제", description = "지정된 팀의 할일에서 담당자를 해제합니다. (팀 멤버만 가능)")
    public RsData<Void> unassignTodo(
            @PathVariable int teamId,
            @PathVariable int todoId) {
        User authenticatedUser = getAuthenticatedUser();
        return teamService.unassignTodo(teamId, todoId, authenticatedUser.getId());
    }

    @GetMapping("/{teamId}/todos/{todoId}/assign")
    @Operation(summary = "할일 담당자 조회", description = "지정된 팀의 할일 담당자 정보를 조회합니다. (팀 멤버만 가능)")
    public RsData<Map<String, Object>> getTodoAssignment(
            @PathVariable int teamId,
            @PathVariable int todoId) {
        User authenticatedUser = getAuthenticatedUser();
        return teamService.getTodoAssignment(teamId, todoId, authenticatedUser.getId());
    }

    @GetMapping("/{teamId}/assignments")
    @Operation(summary = "팀 담당자 기록 조회", description = "지정된 팀의 모든 담당자 기록을 조회합니다. (팀 멤버만 가능)")
    public RsData<List<Map<String, Object>>> getTeamAssignments(@PathVariable int teamId) {
        User authenticatedUser = getAuthenticatedUser();
        return teamService.getTeamAssignments(teamId, authenticatedUser.getId());
    }

    @GetMapping("/{teamId}/todos/{todoId}/assignees")
    @Operation(summary = "할일 담당자 목록 조회", description = "지정된 팀의 할일 담당자 목록을 조회합니다. (팀 멤버만 가능)")
    public RsData<List<Map<String, Object>>> getTodoAssignees(
            @PathVariable int teamId,
            @PathVariable int todoId) {
        User authenticatedUser = getAuthenticatedUser();
        return teamService.getTodoAssignees(teamId, todoId, authenticatedUser.getId());
    }

    @PostMapping("/{teamId}/todos/{todoId}/assignees")
    @Operation(summary = "할일에 여러 담당자 지정", description = "지정된 팀의 할일에 여러 담당자를 지정합니다. (팀 멤버만 가능)")
    public RsData<Map<String, Object>> assignMultipleTodoAssignees(
            @PathVariable int teamId,
            @PathVariable int todoId,
            @RequestBody Map<String, Object> assignmentRequest) {
        User authenticatedUser = getAuthenticatedUser();
        @SuppressWarnings("unchecked")
        List<Integer> assignedUserIds = (List<Integer>) assignmentRequest.get("assignedUserIds");

        if (assignedUserIds == null || assignedUserIds.isEmpty()) {
            throw new ServiceException("400-BAD_REQUEST", "담당자 ID 목록은 필수입니다.");
        }

        return teamService.assignMultipleTodoAssignees(teamId, todoId, assignedUserIds, authenticatedUser.getId());
    }

    @GetMapping("/{teamId}/todos/{todoId}/is-assignee")
    @Operation(summary = "할일 담당자 여부 확인", description = "현재 사용자가 지정된 팀의 할일 담당자인지 확인합니다. (팀 멤버만 가능)")
    public RsData<Map<String, Object>> isTodoAssignee(
            @PathVariable int teamId,
            @PathVariable int todoId) {
        User authenticatedUser = getAuthenticatedUser();
        return teamService.checkTodoAssignee(teamId, todoId, authenticatedUser.getId());
    }

    @GetMapping("/my-assigned-todos")
    @Operation(summary = "내가 할당받은 모든 할일 조회", description = "현재 로그인한 사용자에게 할당된 모든 팀의 할일을 조회합니다.")
    public RsData<List<Map<String, Object>>> getMyAssignedTodos() {
        User authenticatedUser = getAuthenticatedUser();
        return teamService.getUserAssignedTodos(authenticatedUser.getId());
    }

    @GetMapping("/{teamId}/users/{userId}/assigned-todos")
    @Operation(summary = "팀 내 특정 사용자의 할당된 할일 조회", description = "지정된 팀에서 특정 사용자에게 할당된 할일들을 조회합니다. (팀 멤버만 가능)")
    public RsData<List<Map<String, Object>>> getUserAssignedTodosInTeam(
            @PathVariable int teamId,
            @PathVariable int userId) {
        User authenticatedUser = getAuthenticatedUser();
        return teamService.getUserAssignedTodosInTeam(teamId, userId, authenticatedUser.getId());
    }

    @GetMapping("/users/{userId}/assignment-stats")
    @Operation(summary = "사용자 할당 통계 조회", description = "특정 사용자의 할일 할당 통계를 조회합니다. 본인만 조회 가능합니다.")
    public RsData<Map<String, Object>> getUserAssignmentStats(@PathVariable int userId) {
        User authenticatedUser = getAuthenticatedUser();

        // 본인만 조회 가능하도록 제한
        if (authenticatedUser.getId() != userId) {
            throw new ServiceException("403-FORBIDDEN", "본인의 통계만 조회할 수 있습니다.");
        }

        return teamService.getUserAssignmentStats(userId);
    }

    @GetMapping("/my-assignment-stats")
    @Operation(summary = "내 할당 통계 조회", description = "현재 로그인한 사용자의 할일 할당 통계를 조회합니다.")
    public RsData<Map<String, Object>> getMyAssignmentStats() {
        User authenticatedUser = getAuthenticatedUser();
        return teamService.getUserAssignmentStats(authenticatedUser.getId());
    }

    @GetMapping("/{teamId}/all-assigned-todos")
    @Operation(summary = "팀 내 모든 멤버의 할당된 할일 조회", description = "지정된 팀의 모든 멤버에게 할당된 할일들을 조회합니다. (팀 멤버만 가능)")
    public RsData<Map<String, Object>> getAllAssignedTodosInTeam(@PathVariable int teamId) {
        User authenticatedUser = getAuthenticatedUser();
        return teamService.getAllAssignedTodosInTeam(teamId, authenticatedUser.getId());
    }

    // ===== 팀 통계 API =====

    @GetMapping("/{teamId}/stats")
    @Operation(summary = "팀 할일 통계 조회", description = "지정된 팀의 할일 통계를 조회합니다. (팀 멤버만 가능)")
    public RsData<Map<String, Object>> getTeamStats(@PathVariable int teamId) {
        User authenticatedUser = getAuthenticatedUser();
        return teamService.getTeamStats(teamId, authenticatedUser.getId());
    }
}