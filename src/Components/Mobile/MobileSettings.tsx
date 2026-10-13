import { useState } from "react";
import { THEME_PRESETS } from "../Screens/SettingsScreen";
import { getCssVariable } from "../../types_and_functions";

function MobileSettings({ onColorsChange }: {
  onColorsChange: (changes: Record<string, string>) => void;
}) {
  // the preset matching the current CSS variables (empty = "Custom")
  const [active, setActive] = useState(() =>
    THEME_PRESETS.find(preset =>
      Object.entries(preset.colors).every(
        ([variable, hex]) => getCssVariable(variable).toLowerCase() === hex.toLowerCase()
      )
    )?.name ?? ""
  );

  function choose(name: string) {
    const preset = THEME_PRESETS.find(p => p.name === name);
    if (!preset) return;
    for (const [variable, hex] of Object.entries(preset.colors)) {
      document.documentElement.style.setProperty(variable, hex);   // live theme
    }
    onColorsChange(preset.colors);                                  // saved by App
    setActive(name);
  }

  return (
    <div className="m_settings">
      <div className="m_setting_row">
        <div>Preset themes</div>
        <select className="app_input m_select" value={active} onChange={(e) => choose(e.target.value)}>
          <option value="" disabled>Custom</option>
          {THEME_PRESETS.map(preset => (
            <option key={preset.name} value={preset.name}>{preset.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export { MobileSettings };