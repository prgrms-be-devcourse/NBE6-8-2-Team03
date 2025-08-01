// project-root/backend/src/main/java/com/tododuk/domain/team/repository/TeamMemberRepository.java
package com.tododuk.domain.team.repository;

import com.tododuk.domain.team.constant.TeamRoleType;
import com.tododuk.domain.team.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Integer> {

    List<TeamMember> findByTeam_Id(int teamId);

    Optional<TeamMember> findByTeam_IdAndUser_Id(int teamId, int userId);

    // String role 대신 TeamRoleType 사용
    boolean existsByTeam_IdAndUser_IdAndRole(int teamId, int userId, TeamRoleType role); // 이 메서드는 String으로 유지 (DB 저장 값이 String이므로)
    // 혹은 오버로딩하여 TeamRoleType을 받는 메서드 추가 가능
    // boolean existsByTeam_IdAndUser_IdAndRole(int teamId, int userId, TeamRoleType role);

    boolean existsByTeam_IdAndUser_Id(int teamId, int userId);

    long countByTeam_IdAndRole(int teamId, TeamRoleType role); // 타입 변경
}