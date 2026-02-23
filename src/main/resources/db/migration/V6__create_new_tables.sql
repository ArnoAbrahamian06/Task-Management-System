CREATE TABLE subtasks (
                         id BIGSERIAL PRIMARY KEY,
                         title VARCHAR(150) NOT NULL,
                         done BOOLEAN NOT NULL

);

CREATE TABLE task_subtasks (
                               task_id BIGINT NOT NULL,
                               subtask_id BIGINT NOT NULL,

                               PRIMARY KEY (task_id, subtask_id),  

                               CONSTRAINT fk_task_subtasks_task
                                   FOREIGN KEY (task_id)
                                       REFERENCES "tasks"(id)
                                       ON DELETE CASCADE,

                               CONSTRAINT fk_task_subtasks_subtask
                                   FOREIGN KEY (subtask_id)
                                       REFERENCES "subtasks"(id)
                                       ON DELETE CASCADE
);

ALTER TABLE projects ADD COLUMN tasks_count INTEGER;
ALTER TABLE projects ADD COLUMN completed_count INTEGER;
