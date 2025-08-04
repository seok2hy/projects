create table meltube.playlists
(
    `index`    int unsigned auto_increment
        primary key,
    user_email varchar(50)                          not null,
    name       varchar(50)                          not null,
    created_at datetime default current_timestamp() not null,
    updated_at datetime default current_timestamp() not null,
    constraint user_email
        unique (user_email, name),
    constraint playlists_ibfk_1
        foreign key (user_email) references meltube.users (email)
            on update cascade on delete cascade
);

