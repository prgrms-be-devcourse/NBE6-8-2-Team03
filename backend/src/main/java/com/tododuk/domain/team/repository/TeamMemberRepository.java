// project-root/backend/src/main/java/com/tododuk/domain/team/repository/TeamMemberRepository.java
package com.tododuk.domain.team.repository;

import com.tododuk.domain.team.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Integer> {

    List<TeamMember> findByTeam_Id(int teamId);

    Optional<TeamMember> findByTeam_IdAndUser_Id(int teamId, int userId);

    boolean existsByTeam_IdAndUser_IdAndRole(int teamId, int userId, String role);
}