package com.tododuk.domain.team.service;

import com.tododuk.domain.team.constant.TeamRoleType;
import com.tododuk.domain.team.dto.TeamMemberAddRequestDto;
import com.tododuk.domain.team.dto.TeamMemberResponseDto;
import com.tododuk.domain.team.entity.Team;
import com.tododuk.domain.team.entity.TeamMember;
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
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeamMemberService {
    private final TeamMemberRepository teamMemberRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    // 1. 팀 생성 시 초기 리더 멤버 추가 (TeamService에서 호출)
    @Transactional
    public TeamMember createLeaderMember(Team team, User leaderUser) {
        TeamMember leaderMember = TeamMember.builder()
                .user(leaderUser)
                .team(team)
                .role(TeamRoleType.LEADER) // TeamRoleType 사용
                .build();
        team.addMember(leaderMember);
        return teamMemberRepository.save(leaderMember);
    }

    // 2. 특정 팀의 모든 멤버 조회

    public List<TeamMemberResponseDto> getTeamMembers(int teamId, int requesterUserId) {
        if (!teamMemberRepository.existsByTeam_IdAndUser_Id(teamId, requesterUserId)) {
            throw new IllegalStateException("해당 팀의 멤버 목록을 조회할 권한이 없습니다.");
        }
        List<TeamMember> members = teamMemberRepository.findByTeam_Id(teamId);
        return members.stream()
                .map(TeamMemberResponseDto::from)
                .collect(Collectors.toList());
    }
    // 3. 팀 멤버 추가
    @Transactional
    public TeamMemberResponseDto addTeamMember(int teamId, TeamMemberAddRequestDto dto, int inviterUserId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new NoSuchElementException("팀을 찾을 수 없습니다. ID: " + teamId)); // 변경

        User newMemberUser = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new NoSuchElementException("추가하려는 사용자를 찾을 수 없습니다. ID: " + dto.getUserId())); // 변경

        if (!teamMemberRepository.existsByTeam_IdAndUser_IdAndRole(teamId, inviterUserId, TeamRoleType.LEADER)) {
            throw new IllegalStateException("팀 멤버를 추가할 권한이 없습니다."); // 변경
        }

        if (teamMemberRepository.findByTeam_IdAndUser_Id(teamId, dto.getUserId()).isPresent()) {
            throw new IllegalStateException("이미 해당 팀의 멤버입니다. User ID: " + dto.getUserId()); // 변경
        }

        TeamMember teamMember = TeamMember.builder()
                .team(team)
                .user(newMemberUser)
                .role(dto.getRole())
                .build();
        team.addMember(teamMember);
        teamMemberRepository.save(teamMember);


        return TeamMemberResponseDto.from(teamMember);
    }
    // 4. 팀 멤버 역할 변경
    @Transactional
    public TeamMemberResponseDto updateTeamMemberRole(int teamId, int userId, TeamRoleType newRole, int requesterUserId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new NoSuchElementException("팀을 찾을 수 없습니다. ID: " + teamId));

        if (!teamMemberRepository.existsByTeam_IdAndUser_IdAndRole(teamId, requesterUserId, TeamRoleType.LEADER)) {
            throw new IllegalStateException("팀 멤버 역할을 변경할 권한이 없습니다.");
        }

        TeamMember teamMember = teamMemberRepository.findByTeam_IdAndUser_Id(teamId, userId)
                .orElseThrow(() -> new NoSuchElementException("해당 팀의 멤버를 찾을 수 없습니다. User ID: " + userId));

        teamMember.updateRole(newRole);
        return TeamMemberResponseDto.from(teamMember);
    }



    // 5. 팀 멤버 삭제
    @Transactional
    public void deleteTeamMember(int teamId,int memberUserIdToRemove,  int removerUserId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new NoSuchElementException("팀을 찾을 수 없습니다. ID: " + teamId));

        TeamMember teamMember = teamMemberRepository.findByTeam_IdAndUser_Id(teamId, memberUserIdToRemove)

                .orElseThrow(() -> new NoSuchElementException("해당 팀의 멤버를 찾을 수 없습니다. User ID: " + memberUserIdToRemove));


        // 권한 확인: 팀 리더만 팀 멤버 제거 가능
        if (!teamMemberRepository.existsByTeam_IdAndUser_IdAndRole(teamId, removerUserId, TeamRoleType.LEADER)) {
            throw new IllegalStateException("팀 멤버를 제거할 권한이 없습니다."); // 변경
        }

        // 비즈니스 규칙: 마지막 리더는 제거할 수 없음
        if (teamMember.getRole() == TeamRoleType.LEADER) {
            long leaderCount = teamMemberRepository.countByTeam_IdAndRole(teamId, TeamRoleType.LEADER);
            if (leaderCount == 1) {
                throw new IllegalStateException("팀의 마지막 리더는 제거할 수 없습니다."); // 변경
            }

            teamMemberRepository.delete(teamMember);
        }

    }

}
