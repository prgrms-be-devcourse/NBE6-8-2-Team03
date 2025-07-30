package com.tododuk.domain.team.dto;

import com.tododuk.domain.team.constant.TeamRoleType;
import com.tododuk.domain.team.entity.TeamMember;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamMemberResponseDto {
    private int id; // int 타입으로 변경
    private int userId; // int 타입으로 변경
    private String userNickname; // 사용자 정보 포함 (User 엔티티에서 가져옴)
    private int teamId; // int 타입으로 변경
    private TeamRoleType role;
    private LocalDateTime joinedAt;
    private LocalDateTime createDate; // 필드명 변경
    private LocalDateTime modifyDate; // 필드명 변경

    public static TeamMemberResponseDto from(TeamMember teamMember) {
        return TeamMemberResponseDto.builder()
                .id(teamMember.getId())
                .userId(teamMember.getUser().getId())
                .userNickname(teamMember.getUser().getNickName()) // User 엔티티의 nickName 사용
                .teamId(teamMember.getTeam().getId())
                .role(teamMember.getRole())
                .joinedAt(teamMember.getJoinedAt())
                .createDate(teamMember.getCreateDate())
                .modifyDate(teamMember.getModifyDate())
                .build();
    }
}