ALTER TABLE users
    ALTER COLUMN role TYPE VARCHAR(50)
        USING role::text;

ALTER TABLE tasks
    ALTER COLUMN status TYPE VARCHAR(50)
        USING status::text;


ALTER TABLE tasks
    ALTER COLUMN priority TYPE VARCHAR(50)
        USING priority::text;

DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS task_status;
DROP TYPE IF EXISTS task_priority;