package com.tododuk.domain.team.controller;

import com.tododuk.domain.team.dto.TeamCreateRequestDto;
import com.tododuk.domain.team.dto.TeamResponseDto;
import com.tododuk.domain.team.dto.TeamUpdateRequestDto;
import com.tododuk.domain.team.service.TeamService;
import com.tododuk.global.rq.Rq;
import com.tododuk.global.rsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/teams")
@RequiredArgsConstructor
public class TeamController {
    private final TeamService teamService;
    private final Rq rq;

    // 1. 팀 생성
    @Operation(summary = "팀 생성",
            description = "새로운 팀을 생성하고, 생성자를 해당 팀의 리더로 추가합니다.")
    @PostMapping
    public RsData<TeamResponseDto> createTeam(
            @Valid @RequestBody TeamCreateRequestDto createDto) {
        int creatorUserId = rq.getActor().getId();
        // 서비스로부터 받은 RsData 객체를 그대로 반환
        return teamService.createTeam(createDto, creatorUserId);
    }

    // 2. 사용자가 속한 팀 목록 조회
    @Operation(summary = "내가 속한 팀 목록 조회",
            description = "현재 로그인한 사용자가 속한 모든 팀의 목록을 조회합니다.")
    @GetMapping
    public RsData<List<TeamResponseDto>> getMyTeams() {
        int userId = rq.getActor().getId();
        // 서비스로부터 받은 RsData 객체를 그대로 반환
        return teamService.getMyTeams(userId);
    }

    // 3. 특정 팀 상세 조회
    @GetMapping("/{teamId}")
    @Operation(summary = "특정 팀 상세 조회",
            description = "지정된 팀 ID에 해당하는 팀의 상세 정보를 조회합니다. 팀 멤버 정보도 포함됩니다. (해당 팀 멤버만 조회 가능)")
    public RsData<TeamResponseDto> getTeamDetails(
            @PathVariable("teamId") int teamId) {
        int viewrUserId = rq.getActor().getId();
        // 서비스로부터 받은 RsData 객체를 그대로 반환
        return teamService.getTeamDetails(teamId, viewrUserId);
    }

    // 4. 팀 정보 수정 (PATCH)
    @Operation(summary = "리더 - 팀 정보 수정",
            description = "지정된 팀 ID의 정보를 수정합니다. 팀 이름과 설명을 수정할 수 있습니다. (리더만 가능)")
    @PatchMapping("/{teamId}")
    public RsData<TeamResponseDto> updateTeamInfo(
            @PathVariable("teamId") int teamId,
            @Valid @RequestBody TeamUpdateRequestDto updateDto) {
        int updaterUserId = rq.getActor().getId();
        // 서비스로부터 받은 RsData 객체를 그대로 반환
        return teamService.updateTeamInfo(teamId, updateDto, updaterUserId);
    }

    // 5. 팀 삭제
    @Operation(summary = "리더 - 팀 삭제",
            description = "지정된 팀 ID에 해당하는 팀을 삭제합니다. (리더만 가능)")
    @DeleteMapping("/{teamId}")
    public RsData<Void> deleteTeam(@PathVariable int teamId) {
        int deleterUserId = rq.getActor().getId();
        // 서비스로부터 받은 RsData 객체를 그대로 반환
        return teamService.deleteTeam(teamId, deleterUserId);
    }
}