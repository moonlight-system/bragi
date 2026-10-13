import "./Mobile.css";
import { useState } from "react";
import { useMobileNav } from "../../useMobileNav";
import type { Playlist, Song } from "../../types_and_functions";
import type { Player } from "../../usePlayer";
import { MobilePlaylistsScreen, MobileSongsScreen, MobilePlayerScreen } from "./MobileScreens";
import { MobileSettings } from "./MobileSettings";
import { MiniPlayer } from "./MiniPlayer";
import { ActionSheet, TextPrompt } from "./Sheets";
import type { SheetAction } from "./Sheets";
import { pickSongs } from "../../importSongs";

export type MobileActions = {
  createPlaylist: (name: string) => void;
  deletePlaylist: (playlist: Playlist) => void;
  renamePlaylist: (playlist: Playlist, newName: string) => void;
  movePlaylist: (playlist: Playlist, direction: "up" | "down") => void;
  addSongs: (newSongs: Song[], targetPlaylist: Playlist) => void;
  renameSong: (song: Song, newName: string) => void;
  renameArtist: (song: Song, newArtist: string) => void;
  removeSong: (song: Song, playlist: Playlist) => void;
  moveSong: (song: Song, playlist: Playlist, direction: "up" | "down") => void;
  copySong: (song: Song, targetPlaylist: Playlist) => void;
};

// at most one dialog is open at a time
type Modal =
  | { kind: "playlistMenu"; playlist: Playlist }
  | { kind: "songMenu"; song: Song }
  | { kind: "copyPicker"; song: Song }
  | { kind: "prompt"; title: string; initial?: string; onSubmit: (value: string) => void }
  | null;

function MobileShell({ playlists, songs, player, onColorsChange, actions }: {
  playlists: Playlist[];
  songs: Song[];
  player: Player;
  onColorsChange: (changes: Record<string, string>) => void;
  actions: MobileActions;
}) {
  const nav = useMobileNav();
  const [viewedPlaylistId, setViewedPlaylistId] = useState<string | null>(null);
  const viewedPlaylist = playlists.find(p => p.id === viewedPlaylistId) ?? null;

  const [modal, setModal] = useState<Modal>(null);
  const close = () => setModal(null);

  const [importing, setImporting] = useState(false);

  const showFab = nav.screen === "playlists" || (nav.screen === "songs" && viewedPlaylist !== null);

  function onFab() {
    if (nav.screen === "playlists") {
      setModal({ kind: "prompt", title: "New playlist", onSubmit: actions.createPlaylist });
    } else if (nav.screen === "songs" && viewedPlaylist) {
      importInto(viewedPlaylist);
    }
  }

  async function importInto(playlist: Playlist) {
    setImporting(true);
    try {
      await pickSongs((song) => actions.addSongs([song], playlist));
    } catch (err) {
      console.error("import failed:", err);
    } finally {
      setImporting(false);
    }
  }

  function playlistMenuActions(p: Playlist): SheetAction[] {
    const index = playlists.findIndex(x => x.id === p.id);
    const list: SheetAction[] = [
      { label: "Rename", onPick: () => setModal({
          kind: "prompt", title: "Rename playlist", initial: p.name,
          onSubmit: (name) => actions.renamePlaylist(p, name),
      }) },
    ];
    if (index > 0) list.push({ label: "Move up", onPick: () => actions.movePlaylist(p, "up") });
    if (index < playlists.length - 1) list.push({ label: "Move down", onPick: () => actions.movePlaylist(p, "down") });
    list.push({ label: "Delete", danger: true, onPick: () => actions.deletePlaylist(p) });
    return list;
  }

  function songMenuActions(s: Song): SheetAction[] {
    if (!viewedPlaylist) return [];
    const index = viewedPlaylist.songIds.indexOf(s.id);
    const last = viewedPlaylist.songIds.length - 1;
    const list: SheetAction[] = [
      { label: "Rename song", onPick: () => setModal({
          kind: "prompt", title: "Rename song", initial: s.name,
          onSubmit: (name) => actions.renameSong(s, name),
      }) },
      { label: "Edit artist", onPick: () => setModal({
          kind: "prompt", title: "Edit artist", initial: s.artist,
          onSubmit: (artist) => actions.renameArtist(s, artist),
      }) },
    ];
    if (index > 0) list.push({ label: "Move up", onPick: () => actions.moveSong(s, viewedPlaylist, "up") });
    if (index < last) list.push({ label: "Move down", onPick: () => actions.moveSong(s, viewedPlaylist, "down") });
    if (playlists.length > 1) list.push({ label: "Add to another playlist", onPick: () => setModal({ kind: "copyPicker", song: s }) });
    list.push({ label: "Remove from playlist", danger: true, onPick: () => actions.removeSong(s, viewedPlaylist) });
    return list;
  }

  const title =
    nav.screen === "playlists" ? "Bragi" :
    nav.screen === "songs" ? (viewedPlaylist?.name ?? "Songs") :
    nav.screen === "player" ? "Now playing" :
    "Settings";

  const showBackButton = nav.screen === "songs" || nav.screen === "player";
  const showTabBar = nav.screen !== "player";
  const activeTab = nav.screen === "settings" ? "settings" : "playlists";

  return (
    <div className="m_shell">
        <header className="m_topbar">
            {showBackButton && <button className="app_button m_back" onClick={nav.back}>‹</button>}
            <div className="m_title">{title}</div>
        </header>

        <div className="m_content_wrap">
          <main className={`m_content ${showFab ? "m_content_fab" : ""}`}>
            {nav.screen === "playlists" && (
              <MobilePlaylistsScreen
                playlists={playlists}
                onOpen={(p) => { setViewedPlaylistId(p.id); nav.push("songs"); }}
                onMenu={(p) => setModal({ kind: "playlistMenu", playlist: p })}
              />
            )}
            {nav.screen === "songs" && viewedPlaylist && (
              <MobileSongsScreen
                playlist={viewedPlaylist}
                songs={songs}
                playingSongId={player.currentSong?.id ?? null}
                onPlay={(song) => { player.playSong(song, viewedPlaylist); nav.push("player"); }}
                onMenu={(song) => setModal({ kind: "songMenu", song })}
              />
            )}
            {nav.screen === "player" && <MobilePlayerScreen player={player} />}
            {nav.screen === "settings" && <MobileSettings onColorsChange={onColorsChange} />}
          </main>
  
          {showFab && (
            <button className="m_fab" onClick={onFab} aria-label="Add">+</button>
          )}

          {importing && <div className="m_importing">Importing…</div>}
        </div>
  
        {nav.screen !== "player" && (
          <MiniPlayer player={player} onOpen={() => nav.push("player")} />
        )}
  
  
        {showTabBar && (
          <nav className="m_tabbar">
            <button
              className={`m_tab ${activeTab === "playlists" ? "m_tab_active" : ""}`}
              onClick={nav.goToRoot}
            >Playlists</button>
            <button
              className={`m_tab ${activeTab === "settings" ? "m_tab_active" : ""}`}
              onClick={() => { if (nav.screen !== "settings") nav.push("settings"); }}
            >Settings</button>
          </nav>
        )}
  
        {modal?.kind === "playlistMenu" && (
          <ActionSheet title={modal.playlist.name} actions={playlistMenuActions(modal.playlist)} onClose={close} />
        )}
        {modal?.kind === "songMenu" && (
          <ActionSheet title={modal.song.name} actions={songMenuActions(modal.song)} onClose={close} />
        )}
        {modal?.kind === "copyPicker" && viewedPlaylist && (
          <ActionSheet
            title={`Add "${modal.song.name}" to:`}
            actions={playlists
              .filter(p => p.id !== viewedPlaylist.id)
              .map(p => ({ label: p.name, onPick: () => actions.copySong(modal.song, p) }))}
            onClose={close}
          />
        )}
        {modal?.kind === "prompt" && (
          <TextPrompt title={modal.title} initial={modal.initial} onSubmit={modal.onSubmit} onClose={close} />
        )}
    </div>
  );
}

export { MobileShell };