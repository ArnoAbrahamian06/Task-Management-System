-- 1. Таблица самих команд
CREATE TABLE teams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Таблица участников (связующая сущность)
-- Именно она позволяет пользователю быть в разных командах
CREATE TABLE team_members (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    position VARCHAR(100), -- Должность именно в ЭТОЙ команде
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Внешние ключи
    CONSTRAINT fk_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- Уникальность: один и тот же юзер не может войти в одну команду дважды
    CONSTRAINT unique_team_user UNIQUE (team_id, user_id)
);