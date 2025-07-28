package com.tododuk.domain.team.entity;

import com.tododuk.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "teams")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Team extends BaseEntity {

    @Column(name = "name", nullable = false, length = 255) // DB 컬럼명은 'name'으로 유지하고, 필드명은 'teamName'으로 사용
    private String teamName; // 필드명 변경: name -> teamName

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TeamMember> members = new ArrayList<>();

    public void updateTeam(String teamName, String description) { // 메서드 파라미터 변경: name -> teamName
        if (teamName != null && !teamName.isBlank()) {
            this.teamName = teamName; // 필드명 변경 반영
        }
        if (description != null) {
            this.description = description;
        }
    }

    public void addMember(TeamMember teamMember) {
        this.members.add(teamMember);
        teamMember.setTeam(this);
    }

    public void removeMember(TeamMember teamMember) {
        this.members.remove(teamMember);
        teamMember.setTeam(null);
    }
}