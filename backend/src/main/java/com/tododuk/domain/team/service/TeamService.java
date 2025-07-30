package com.tododuk.domain.team.service; // 패키지명 확인

import com.tododuk.domain.team.constant.TeamRoleType;
import com.tododuk.domain.team.dto.TeamCreateRequestDto;
import com.tododuk.domain.team.dto.TeamResponseDto;
import com.tododuk.domain.team.dto.TeamUpdateRequestDto;
import com.tododuk.domain.team.entity.Team;
import com.tododuk.domain.team.repository.TeamMemberRepository;
import com.tododuk.domain.team.repository.TeamRepository;
import com.tododuk.domain.user.entity.User;
import com.tododuk.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
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
    public TeamResponseDto createTeam(TeamCreateRequestDto dto, int creatorUserId) {
        User createrUser = userRepository.findById(creatorUserId)
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다. ID: " + creatorUserId));

        Team team = Team.builder()
                .teamName(dto.getTeamName())
                .description(dto.getDescription())
                .build();
        teamRepository.save(team);

        // 팀 생성 시 리더 멤버 추가
        teamMemberService.createLeaderMember(team, createrUser);

        // 팀 생성 후 응답 DTO로 변환
        return TeamResponseDto.from(team);
    }

    // 2. 사용자가 속한 팀 목록 조회
    public List<TeamResponseDto> getMyTeams(int userId) {
        List<Team> teams = teamRepository.findTeamsByUserId(userId);
        return teams.stream()
                .map(TeamResponseDto::from)
                .collect(Collectors.toList());
    }

    // 3. 특정 팀 상세 조회
    public TeamResponseDto getTeamDetails(int teamId, int viewerUserId) {
        Team team = teamRepository.findByIdWithMembers(teamId)
                .orElseThrow(() -> new NoSuchElementException("팀을 찾을 수 없습니다. ID: " + teamId)); // 변경

        boolean isMember = teamMemberRepository.existsByTeam_IdAndUser_Id(teamId, viewerUserId);
        if (!isMember) {
            throw new IllegalStateException("해당 팀의 정보를 조회할 권한이 없습니다."); // 변경
        }

        return TeamResponseDto.from(team);

    }
    // 4. 팀 정보 수정 (PATCH)
    @Transactional
    public TeamResponseDto updateTeamInfo(int teamId, TeamUpdateRequestDto dto, int modifierUserId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new NoSuchElementException("팀을 찾을 수 없습니다. ID: " + teamId));

        // 팀 수정 권한 확인
        if (!teamMemberRepository.existsByTeam_IdAndUser_IdAndRole(teamId, modifierUserId, TeamRoleType.LEADER)) {
            throw new IllegalStateException("팀 정보를 수정할 권한이 없습니다.");
        }

        // 팀 정보 업데이트
        team.updateTeam(dto.getTeamName(), dto.getDescription());
        teamRepository.save(team);

        return TeamResponseDto.from(team);
    }
    // 5. 팀 삭제
    @Transactional
    public void deleteTeam(int teamId, int deleterUserId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new NoSuchElementException("팀을 찾을 수 없습니다. ID: " + teamId));

        // 팀 삭제 권한 확인
        if (!teamMemberRepository.existsByTeam_IdAndUser_IdAndRole(teamId, deleterUserId, TeamRoleType.LEADER)) {
            throw new IllegalStateException("팀을 삭제할 권한이 없습니다.");
        }

        teamRepository.delete(team);

    }

}