create table meltube.music_user_likes
(
    music_index int unsigned                         not null,
    user_email  varchar(50)                          not null,
    created_at  datetime default current_timestamp() not null,
    primary key (music_index, user_email),
    constraint music_user_likes_ibfk_1
        foreign key (music_index) references meltube.musics (`index`)
            on update cascade on delete cascade,
    constraint music_user_likes_ibfk_2
        foreign key (user_email) references meltube.users (email)
            on update cascade on delete cascade
);

create index user_email
    on meltube.music_user_likes (user_email);

