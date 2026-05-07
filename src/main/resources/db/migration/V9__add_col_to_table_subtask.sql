ALTER TABLE subtasks ADD COLUMN task_id BIGINT;

ALTER TABLE subtasks
    ADD CONSTRAINT fk_subtasks_task
        FOREIGN KEY (task_id)
            REFERENCES tasks(id)
            ON DELETE CASCADE;

DROP TABLE IF EXISTS task_subtasks;

ALTER TABLE subtasks ALTER COLUMN title TYPE VARCHAR(500);