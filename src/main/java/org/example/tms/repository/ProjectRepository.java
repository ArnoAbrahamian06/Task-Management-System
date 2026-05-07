package org.example.tms.repository;

import org.example.tms.entity.Project;
import org.example.tms.entity.Team;
import org.example.tms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByName(String name);

    Boolean existsByOwnerAndName(User owner, String name);

    Collection<Project> findByTeam_Members_User(User user);

    @Query("SELECT SUM(p.tasksCount) FROM Project p " +
            "JOIN p.team t " +
            "JOIN TeamMember tm ON tm.team = t " +
            "WHERE tm.user = :user")
    Long countTotalTasksInMyProjects(@Param("user") User user);

    @Query("SELECT p FROM Project p JOIN FETCH p.team WHERE p.team IN :teams")
    List<Project> findAllByTeamInWithFetch(@Param("teams") List<Team> teams);
}
