create table meltube.users
(
    email        varchar(50)                            not null
        primary key,
    password     varchar(255)                           not null,
    nickname     varchar(10)                            not null,
    created_at   datetime   default current_timestamp() not null,
    is_admin     tinyint(1) default 0                   not null,
    is_deleted   tinyint(1) default 0                   not null,
    is_suspended tinyint(1) default 0                   not null,
    constraint nickname
        unique (nickname)
);

