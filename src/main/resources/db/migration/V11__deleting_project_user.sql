ALTER TABLE team_members
ADD CONSTRAINT uk_user_team UNIQUE (user_id, team_id);

DROP TABLE IF EXISTS project_members;

ALTER TABLE projects ADD COLUMN IF NOT EXISTS team_id BIGINT;

ALTER TABLE projects
    ADD CONSTRAINT fk_projects_team_id_Teams
        FOREIGN KEY (team_id) REFERENCES Teams(id)
            ON DELETE CASCADE;

ALTER TABLE Tasks DROP CONSTRAINT IF EXISTS fk_Tasks_assignee_id_Team_members;

ALTER TABLE Tasks
    ADD CONSTRAINT fk_Tasks_assignee_id_Team_members
        FOREIGN KEY (assignee_id) REFERENCES team_members(id)
            ON DELETE SET NULL;