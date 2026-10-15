import { useMemo, useState } from "react";
import { listDeviceMp3s } from "../../nativeAudio";
import type { DeviceMp3 } from "../../nativeAudio";

function Mp3Picker({ onImport, onClose }: {
  onImport: (items: DeviceMp3[]) => void;
  onClose: () => void;
}) {
  const all = useMemo(() => listDeviceMp3s(), []);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div className="m_picker">
      <div className="m_sheet_title">
        {all.length === 0 ? "No mp3 files found" : `${all.length} mp3 files`}
      </div>
      <div className="m_picker_list">
        {all.map(item => (
          <label key={item.id} className="m_picker_row">
            <input
              type="checkbox"
              className="m_checkbox"
              checked={selected.has(item.id)}
              onChange={() => toggle(item.id)}
            />
            <div className="m_row_text">
              <div className="m_picker_name">{item.name}</div>
              <div className="m_item_sub">{item.artist ?? "Unknown Artist"}</div>
            </div>
          </label>
        ))}
      </div>
      <div className="m_dialog_buttons m_picker_footer">
        <button className="app_button" onClick={onClose}>Cancel</button>
        <button
          className="app_button"
          disabled={selected.size === 0}
          onClick={() => onImport(all.filter(i => selected.has(i.id)))}
        >Import ({selected.size})</button>
      </div>
    </div>
  );
}

export { Mp3Picker };