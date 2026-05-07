package org.example.tms.repository;

import org.example.tms.entity.Team;
import org.example.tms.entity.TeamMember;
import org.example.tms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    // Найти запись о членстве конкретного юзера в конкретной команде
    // Нужно для проверки прав (например, является ли он Тимлидом)
    Optional<TeamMember> findByUserAndTeam(User user, Team team);

    // Получить все членства пользователя (чтобы понять, в каких командах он состоит)
    List<TeamMember> findAllByUser(User user);

    // Получить всех участников конкретной команды
    List<TeamMember> findAllByTeam(Team team);

    boolean existsByUserAndTeam(User user, Team team);


    // Оптимизированный запрос для получения всех коллег во всех командах юзера
    // Помогает избежать проблемы N+1 при загрузке списков
    @Query("SELECT tm FROM TeamMember tm " +
            "JOIN FETCH tm.user " +
            "JOIN FETCH tm.team " +
            "WHERE tm.team.id IN (SELECT m.team.id FROM TeamMember m WHERE m.user = :user)")
    List<TeamMember> findAllCoworkersByUser(@Param("user") User user);
}