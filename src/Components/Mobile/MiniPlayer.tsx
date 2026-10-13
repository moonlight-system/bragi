import type { Player } from "../../usePlayer";

function MiniPlayer({ player, onOpen }: {
  player: Player;
  onOpen: () => void;
}) {
  const song = player.currentSong;
  if (!song) return null;

  // the buttons must not also trigger the "open full player" tap on the card
  const press = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    action();
  };

  return (
    <div className="m_miniplayer" onClick={onOpen}>
      <div className="m_cover m_cover_small" />
      <div className="m_mini_text">
        <div className="m_mini_name">{song.name}</div>
        <div className="m_mini_artist">{song.artist}</div>
      </div>
      <div className="m_mini_controls">
        <button className="m_mini_btn" onClick={press(player.previous)}>«</button>
        <button className="m_mini_btn" onClick={press(player.togglePlay)}>
          {player.isPlaying ? "❚❚" : "▶"}
        </button>
        <button className="m_mini_btn" onClick={press(player.next)}>»</button>
      </div>
    </div>
  );
}

export { MiniPlayer };