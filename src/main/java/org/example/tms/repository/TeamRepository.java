package org.example.tms.repository;

import org.example.tms.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {

    // Поиск команд по названию (например, для проверки уникальности)
    Optional<Team> findByName(String name);

    // Проверка существования команды
    boolean existsByName(String name);
}
