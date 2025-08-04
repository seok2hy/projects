create table meltube.playlist_music_mappings
(
    `index`        int unsigned auto_increment
        primary key,
    playlist_index int unsigned not null,
    music_index    int unsigned not null,
    constraint playlist_music_mappings_ibfk_1
        foreign key (playlist_index) references meltube.playlists (`index`)
            on update cascade on delete cascade,
    constraint playlist_music_mappings_ibfk_2
        foreign key (music_index) references meltube.musics (`index`)
            on update cascade on delete cascade
);

create index music_index
    on meltube.playlist_music_mappings (music_index);

create index playlist_index
    on meltube.playlist_music_mappings (playlist_index);

