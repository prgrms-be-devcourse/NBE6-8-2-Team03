package com.tododuk.domain.team.service;

import com.tododuk.domain.team.constant.TeamRoleType;
import com.tododuk.domain.team.dto.TeamCreateRequestDto;
import com.tododuk.domain.team.dto.TeamResponseDto;
import com.tododuk.domain.team.dto.TeamUpdateRequestDto;
import com.tododuk.domain.team.entity.Team;
import com.tododuk.domain.team.repository.TeamMemberRepository;
import com.tododuk.domain.team.repository.TeamRepository;
import com.tododuk.domain.user.entity.User;
import com.tododuk.domain.user.repository.UserRepository;
import com.tododuk.global.exception.ServiceException;
import com.tododuk.global.rsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final TeamMemberService teamMemberService;

    // 1. 팀 생성
    @Transactional
    public RsData<TeamResponseDto> createTeam(TeamCreateRequestDto dto, int creatorUserId) {
        User creatorUser = userRepository.findById(creatorUserId)
                .orElseThrow(() -> new ServiceException("404-USER_NOT_FOUND", "사용자를 찾을 수 없습니다. ID: " + creatorUserId));

        Team team = Team.builder()
                .teamName(dto.getTeamName())
                .description(dto.getDescription())
                .build();
        teamRepository.save(team);
        teamMemberService.createLeaderMember(team, creatorUser);
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

    // 3. 특정 팀 상세 조회
    public RsData<TeamResponseDto> getTeamDetails(int teamId, int viewerUserId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ServiceException("404-TEAM_NOT_FOUND", "팀을 찾을 수 없습니다. ID: " + teamId));

        boolean isMember = teamMemberRepository.existsByTeam_IdAndUser_Id(teamId, viewerUserId);
        if (!isMember) {
            throw new ServiceException("403-NO_PERMISSION", "해당 팀의 정보를 조회할 권한이 없습니다.");
        }

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
}