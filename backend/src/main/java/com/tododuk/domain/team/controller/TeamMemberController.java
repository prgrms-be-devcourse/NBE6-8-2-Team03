package com.tododuk.domain.team.controller;

import com.tododuk.domain.team.dto.TeamMemberAddRequestDto;
import com.tododuk.domain.team.dto.TeamMemberResponseDto;
import com.tododuk.domain.team.dto.TeamMemberUpdateRequestDto;
import com.tododuk.domain.team.service.TeamMemberService;
import com.tododuk.global.rq.Rq;
import com.tododuk.global.rsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/teams/{teamId}/members")
@RequiredArgsConstructor
public class TeamMemberController {
    private final TeamMemberService teamMemberService;
    private final Rq rq;

    @Operation(summary = "특정 팀의 멤버 목록 조회",
            description = "지정된 팀 ID에 속한 모든 멤버의 목록을 조회합니다. (해당 팀 멤버만 조회 가능)")
    @GetMapping
    public RsData<List<TeamMemberResponseDto>> getTeamMembers(
            @PathVariable int teamId
    ) {
        int requesterUserId = rq.getActor().getId();
        List<TeamMemberResponseDto> teamMembers = teamMemberService.getTeamMembers(teamId, requesterUserId);
        return new RsData<>("200-1", "팀 멤버 목록 조회 성공", teamMembers);
    }


    @Operation(summary = "리더 - 팀 멤버 추가",
            description = "지정된 팀에 새로운 멤버를 추가합니다. (리더만 가능)")
    @PostMapping
    public RsData<TeamMemberResponseDto> createTeamMember(
            @PathVariable int teamId,
            @Valid @RequestBody TeamMemberAddRequestDto addDto) {

        int requesterUserId = rq.getActor().getId();
        TeamMemberResponseDto responseDto = teamMemberService.addTeamMember(teamId, addDto, requesterUserId);
        return new RsData<>("201-1", "팀 멤버 추가 성공", responseDto);
    }


    @Operation(summary = "리더 - 팀 멤버 역할 변경",
            description = "지정된 팀의 특정 멤버 역할을 변경합니다. (리더만 가능)")
    @PatchMapping("/{memberUserId}/role")
    public RsData<TeamMemberResponseDto> updateTeamMemberRole(
            @PathVariable int teamId,
            @PathVariable int memberUserId,
            @Valid @RequestBody TeamMemberUpdateRequestDto updateDto) {

        int requesterUserId = rq.getActor().getId();
        TeamMemberResponseDto responseDto = teamMemberService.updateTeamMemberRole(teamId, memberUserId, updateDto.getRole(), requesterUserId);
        return new RsData<>("200-1", "팀 멤버 역할 변경 성공", responseDto);
    }


    @Operation(summary = "리더 - 팀 멤버 제거 (강퇴)",
            description = "지정된 팀에서 특정 멤버를 강제로 제거합니다. (리더만 가능)")
    @DeleteMapping("/{memberUserId}")
    public RsData<Void> deleteTeamMember(
            @PathVariable int teamId,
            @PathVariable int memberUserId) {

        int requesterUserId = rq.getActor().getId();
        teamMemberService.deleteTeamMember(teamId, memberUserId, requesterUserId);
        return new RsData<>("200-1", "팀 멤버 제거 성공");
    }
}
