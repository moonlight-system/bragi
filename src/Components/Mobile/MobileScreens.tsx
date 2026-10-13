import type { Playlist, Song } from "../../types_and_functions";
import type { Player } from "../../usePlayer";
import { Visualizer } from "../Visualizer";
import { ProgressBar } from "../ProgressBar";
import { PressableRow } from "./PressableRow";

function MobilePlaylistsScreen({ playlists, onOpen, onMenu }: {
  playlists: Playlist[];
  onOpen: (playlist: Playlist) => void;
  onMenu: (playlist: Playlist) => void;
}) {
  if (playlists.length === 0) return <div className="m_empty">No playlists yet</div>;
  return (
    <div>
      {playlists.map(p => (
        <PressableRow key={p.id} className="m_playlist_item" onTap={() => onOpen(p)} onMenu={() => onMenu(p)}>
          <div className="m_cover" />
          <div className="m_playlist_text">
            <div className="m_playlist_name">{p.name}</div>
            <div className="m_item_sub">
              {p.songIds.length} {p.songIds.length === 1 ? "song" : "songs"}
            </div>
          </div>
        </PressableRow>
      ))}
    </div>
  );
}

function MobileSongsScreen({ playlist, songs, playingSongId, onPlay, onMenu }: {
  playlist: Playlist;
  songs: Song[];
  playingSongId: string | null;
  onPlay: (song: Song) => void;
  onMenu: (song: Song) => void;
}) {
  const playlistSongs = playlist.songIds
    .map(id => songs.find(s => s.id === id))
    .filter((s): s is Song => s !== undefined);

  if (playlistSongs.length === 0) return <div className="m_empty">No songs yet. Tap + to add some.</div>;
  return (
    <div>
      {playlistSongs.map(s => (
        <PressableRow key={s.id} className="m_list_item" onTap={() => onPlay(s)} onMenu={() => onMenu(s)}>
          <div className="m_row_text">
            <div style={{ color: s.id === playingSongId ? "var(--songs-accent-color)" : "var(--text-color)" }}>
              {s.name}
            </div>
            <div className="m_item_sub">{s.artist}</div>
          </div>
        </PressableRow>
      ))}
    </div>
  );
}

function MobilePlayerScreen({ player }: { player: Player }) {
  const song = player.currentSong;
  const accent = (on: boolean) => ({ color: on ? "var(--buttons-accent-color)" : "var(--text-color)" });

  return (
    <div className="m_player">
      <div className="m_visualizer"><Visualizer /></div>

      <div className="m_now_playing">
        <div className="m_song_name">{song?.name ?? "Nothing playing"}</div>
        <div className="m_song_artist">{song?.artist ?? ""}</div>
      </div>

      <ProgressBar />

      <div className="m_controls_main">
        <button className="app_button" onClick={player.previous}>Prev</button>
        <button className="app_button m_play" onClick={player.togglePlay}>
          {player.isPlaying ? "Pause" : "Play"}
        </button>
        <button className="app_button" onClick={player.next}>Next</button>
      </div>

      <div className="m_controls_secondary">
        <button className="app_button" onClick={() => player.seekBy(-10)}>-10s</button>
        <button className="app_button" onClick={() => player.seekBy(10)}>+10s</button>
        <button className="app_button" style={accent(player.loop)} onClick={player.toggleLoop}>Loop</button>
        <button className="app_button" style={accent(player.shuffle)} onClick={player.toggleShuffle}>Shuffle</button>
      </div>
    </div>
  );
}

export { MobilePlaylistsScreen, MobileSongsScreen, MobilePlayerScreen };