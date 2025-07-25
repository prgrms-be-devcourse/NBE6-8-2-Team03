package com.tododuk.domain.team.entity;

import com.tododuk.domain.teamMember.entity.TeamMember;
import com.tododuk.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Getter
@NoArgsConstructor
public class Team extends BaseEntity {
    private String teamName;
    private String description;

    @OneToMany
    private List<TeamMember> teamMember;

}
