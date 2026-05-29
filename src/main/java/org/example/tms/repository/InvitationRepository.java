package org.example.tms.repository;

import org.example.tms.entity.Invitation;
import org.example.tms.entity.Team;
import org.example.tms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    List<Invitation> findAllByUserAndStatus(User user, String status);

    List<Invitation> findAllByTeamAndStatus(Team team, String status);

    boolean existsByUserAndTeamAndStatus(User user, Team team, String status);
}
