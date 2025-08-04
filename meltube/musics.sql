create table meltube.musics
(
    `index`                  int unsigned auto_increment
        primary key,
    user_email               varchar(50)                                                       not null,
    artist                   varchar(100)                                                      not null,
    album                    varchar(100)                                                      not null,
    name                     varchar(100)                                                      not null,
    genre                    varchar(100)                                                      not null,
    lyrics                   mediumtext                                                        not null,
    release_date             date                                                              not null,
    cover_image_data         longblob                                                          not null,
    cover_image_name         varchar(255)                                                      not null,
    cover_image_content_type varchar(50)                                                       not null,
    youtube_id               varchar(50)                                                       not null,
    status                   enum ('ALLOWED', 'DENIED', 'PENDING') default 'PENDING'           not null,
    denied_reason            varchar(1000)                                                     null,
    created_at               datetime                              default current_timestamp() not null,
    updated_at               datetime                              default current_timestamp() not null,
    is_deleted               tinyint(1)                            default 0                   not null,
    constraint youtube_id_unique_key
        unique (youtube_id),
    constraint musics_ibfk_1
        foreign key (user_email) references meltube.users (email)
            on update cascade on delete cascade
);

create index user_email
    on meltube.musics (user_email);

