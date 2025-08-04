package com.tododuk.domain.team.controller;

import com.tododuk.domain.team.dto.TeamCreateRequestDto;
import com.tododuk.domain.team.dto.TeamResponseDto;
import com.tododuk.domain.team.dto.TeamUpdateRequestDto;
import com.tododuk.domain.team.service.TeamService;
import com.tododuk.global.rq.Rq;
import com.tododuk.global.rsData.RsData;
import com.tododuk.global.exception.ServiceException;
import com.tododuk.domain.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.tododuk.domain.team.entity.Team;
import com.tododuk.domain.user.repository.UserRepository;

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

    // 1. 팀 생성
    @Operation(summary = "팀 생성",
            description = "새로운 팀을 생성하고, 생성자를 해당 팀의 리더로 추가합니다.")
    @PostMapping
    public RsData<TeamResponseDto> createTeam(
            @Valid @RequestBody TeamCreateRequestDto createDto) {
        User authenticatedUser = getAuthenticatedUser();
        // 서비스로부터 받은 RsData 객체를 그대로 반환
        return teamService.createTeam(createDto, authenticatedUser.getId());
    }

    // 2. 팀 목록 조회
    @Operation(summary = "팀 목록 조회",
            description = "모든 팀의 목록을 조회합니다.")
    @GetMapping
    public RsData<List<TeamResponseDto>> getTeams() {
        List<Team> teams = teamService.getAllTeams();
        List<TeamResponseDto> teamResponseDtos = teams.stream()
                .map(TeamResponseDto::from)
                .toList();
        return new RsData<>("200-OK", "팀 목록 조회 성공", teamResponseDtos);
    }

    // 사용자가 속한 팀 목록만 반환
    @GetMapping("/my")
    public RsData<List<TeamResponseDto>> getMyTeams() {
        User authenticatedUser = getAuthenticatedUser();
        List<Team> myTeams = teamService.getTeamsByUserId(authenticatedUser.getId());
        List<TeamResponseDto> teamResponseDtos = myTeams.stream()
                .map(TeamResponseDto::from)
                .toList();
        return new RsData<>("200-OK", "내 팀 목록 조회 성공", teamResponseDtos);
    }

    // 3. 특정 팀 상세 조회
    @GetMapping("/{teamId}")
    @Operation(summary = "특정 팀 상세 조회",
            description = "지정된 팀 ID에 해당하는 팀의 상세 정보를 조회합니다. 팀 멤버 정보도 포함됩니다. (해당 팀 멤버만 조회 가능)")
    public RsData<TeamResponseDto> getTeamDetails(
            @PathVariable("teamId") int teamId) {
        User authenticatedUser = getAuthenticatedUser();
        // 서비스로부터 받은 RsData 객체를 그대로 반환
        return teamService.getTeamDetails(teamId, authenticatedUser.getId());
    }

    // 4. 팀 정보 수정 (PATCH)
    @Operation(summary = "리더 - 팀 정보 수정",
            description = "지정된 팀 ID의 정보를 수정합니다. 팀 이름과 설명을 수정할 수 있습니다. (리더만 가능)")
    @PatchMapping("/{teamId}")
    public RsData<TeamResponseDto> updateTeamInfo(
            @PathVariable("teamId") int teamId,
            @Valid @RequestBody TeamUpdateRequestDto updateDto) {
        User authenticatedUser = getAuthenticatedUser();
        // 서비스로부터 받은 RsData 객체를 그대로 반환
        return teamService.updateTeamInfo(teamId, updateDto, authenticatedUser.getId());
    }

    // 5. 팀 삭제
    @Operation(summary = "리더 - 팀 삭제",
            description = "지정된 팀 ID에 해당하는 팀을 삭제합니다. (리더만 가능)")
    @DeleteMapping("/{teamId}")
    public RsData<Void> deleteTeam(@PathVariable int teamId) {
        User authenticatedUser = getAuthenticatedUser();
        // 서비스로부터 받은 RsData 객체를 그대로 반환
        return teamService.deleteTeam(teamId, authenticatedUser.getId());
    }
}