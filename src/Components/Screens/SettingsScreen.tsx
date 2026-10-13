import { useEffect, useState } from "react";
import './SettingsScreen.css';
import { CursorList } from "../CursorList";
import { PaletteColorPicker } from "../PaletteColorPicker";
import { getCssVariable } from "../../types_and_functions";

const ACCENT_PALETTE = [
    "#ff0000", "#fc7100", "#ffbb00", "#07d300", "#00ff9d", "#00e6d2", "#1640ff", "#ad009f", "#ff10eb", "#d8d8d8",
    "#ff4848", "#ff9f50", "#ffd45f", "#64ff5f", "#67ffc5", "#78fff4", "#5c7aff", "#8d3b86", "#ff79f4", "#353535",
];

type ThemeSetting = {
    label: string;
    variable: string;
    palette: string[];
    underGlobal?: boolean;
};

const GLOBAL_ACCENT = "--global-accent-color";

const THEME_SETTINGS: ThemeSetting[] = [
    { label: "Global accent color", variable: GLOBAL_ACCENT, palette: ACCENT_PALETTE },
    { label: "Title color", variable: "--title-accent-color", palette: ACCENT_PALETTE, underGlobal: true },
    { label: "Playlists panel color", variable: "--playlist-accent-color", palette: ACCENT_PALETTE, underGlobal: true },
    { label: "Songs panel color", variable: "--songs-accent-color", palette: ACCENT_PALETTE, underGlobal: true },
    { label: "Song name color", variable: "--song-name-accent-color", palette: ACCENT_PALETTE, underGlobal: true },
    { label: "Progress bar color", variable: "--progress-accent-color", palette: ACCENT_PALETTE, underGlobal: true },
    { label: "Player buttons color", variable: "--buttons-accent-color", palette: ACCENT_PALETTE, underGlobal: true },
    { label: "Visualizer color", variable: "--visualizer-accent-color", palette: ACCENT_PALETTE, underGlobal: true },
    { label: "Settings side panel color", variable: "--settings-side-accent-color", palette: ACCENT_PALETTE, underGlobal: true },
    {
        label: "Primary background color", variable: "--primary-bg-color",
        palette: ["#25252B", "#393949", "#525269", "#cacaca", "#d0d0ee", "#e6d7c3", "#cfcfcf"],
    },
    {
        label: "Secondary background color", variable: "--secondary-bg-color",
        palette: ["#1c1c20", "#31313b", "#434355", "#a8a8a8", "#bebee7", "#dcc8ac", "#bfbfbf"],
    },
    {
        label: "Tertiary background color", variable: "--tertiary-bg-color",
        palette: ["#141418", "#272731", "#3a3a4d", "#969696", "#acacdd", "#dcc8ac", "#bfbfbf"],
    },
    { label: "Text color", variable: "--text-color", palette: ["#0f0f0f", "#ffffff"] },
];

type ThemePreset = {
    name: string;
    colors: Record<string, string>;   // CSS variable -> color, for every setting
};

// builds a full preset: one accent for everything under the global setting,
// plus optional per-setting overrides
function buildPreset(
    accent: string,
    backgrounds: [string, string, string],   // primary, secondary, tertiary
    text: string,
    overrides: Record<string, string> = {},
): Record<string, string> {
    const colors: Record<string, string> = {
        [GLOBAL_ACCENT]: accent,
        "--primary-bg-color": backgrounds[0],
        "--secondary-bg-color": backgrounds[1],
        "--tertiary-bg-color": backgrounds[2],
        "--text-color": text,
    };
    for (const setting of THEME_SETTINGS) {
        if (setting.underGlobal) colors[setting.variable] = accent;
    }
    return { ...colors, ...overrides };
}

const THEME_PRESETS: ThemePreset[] = [
    { name: "Bragi", colors: buildPreset("#00ff9d", ["#25252B", "#1c1c20", "#141418"], "#ffffff") },
    { name: "Midnight", colors: buildPreset("#5c7aff", ["#1b1f33", "#151827", "#0f1220"], "#ffffff") },
    {
        name: "Sunset",
        colors: buildPreset("#ff9f50", ["#2a1f26", "#221a20", "#1a1418"], "#ffffff", {
            "--title-accent-color": "#ff4848",
            "--progress-accent-color": "#ff9148",
            "--visualizer-accent-color": "#ffd45f",
        }),
    },
    {
        name: "Espresso",
        colors: buildPreset("#d9a066", ["#2b1f19", "#231915", "#1a110e"], "#efe3d0", {
            "--title-accent-color": "#f2d3a4",
            "--visualizer-accent-color": "#c8864a",
        }),
    },
    {
        name: "Red Velvet",
        colors: buildPreset("#e5383b", ["#1a0b0d", "#130709", "#0c0405"], "#f2e6e6", {
            "--title-accent-color": "#c1121f",
            "--visualizer-accent-color": "#ff5a5f",
        }),
    },
    {
        name: "Forest",
        colors: buildPreset("#34c17b", ["#16251c", "#101c15", "#0b130e"], "#e6f2e4", {
            "--title-accent-color": "#b9e4a3",
            "--visualizer-accent-color": "#7ddf64",
        }),
    },
    {
        name: "Synthwave",
        colors: buildPreset("#ff3cac", ["#241734", "#1b1027", "#130a1c"], "#f3e9ff", {
            "--title-accent-color": "#2de2e6",
            "--visualizer-accent-color": "#2de2e6",
            "--progress-accent-color": "#ffd319",
        }),
    },
    {
        name: "Graphite",
        colors: buildPreset("#f5f5f5", ["#262626", "#1c1c1c", "#121212"], "#a8a8a8", {
            "--title-accent-color": "#ffffff",
            "--visualizer-accent-color": "#d0d0d0",
        }),
    },
    {
        name: "Amethyst",
        colors: buildPreset("#b794f6", ["#231a33", "#1a1327", "#120c1c"], "#e9e1f5", {
            "--title-accent-color": "#d6bcfa",
            "--visualizer-accent-color": "#9f7aea",
        }),
    },
    {
        name: "Ocean",
        colors: buildPreset("#ff8a75", ["#0f2a33", "#0b2028", "#07161c"], "#e0f2f1", {
            "--title-accent-color": "#ffb199",
            "--visualizer-accent-color": "#4fd1c5",
        }),
    },
    {
        name: "Amber",
        colors: buildPreset("#ffcc4d", ["#17120b", "#110d08", "#0b0805"], "#a87927", {
            "--visualizer-accent-color": "#ffa726",
        }),
    },

    {
        name: "Angel",
        colors: buildPreset("#009baf", ["#f4f2ee", "#dae5e6", "#becccf"], "#2b2b2e", {
            "--title-accent-color": "#009baf",
            "--visualizer-accent-color": "#009baf",
        }),
    },
    {
        name: "Latte",
        colors: buildPreset("#a55c2e", ["#efe3d0", "#e1d0b8", "#d2bd9f"], "#3b2a20", {
            "--title-accent-color": "#a55c2e",
            "--visualizer-accent-color": "#e6b251",
        }),
    },
    {
        name: "Mango",
        colors: buildPreset("#c9341c", ["#FFF1D6", "#FFE0B0", "#FFCB91"], "#3d1f14", {
            "--title-accent-color": "#a3260f",
            "--visualizer-accent-color": "#f26b1d",
        }),
    },
    {
        name: "Trans rights !!",
        colors: buildPreset("#FF0087", ["#B0FFFA", "#75ffff", "#2dcadf"], "#3b1030", {
            "--title-accent-color": "#ff1893",
            "--visualizer-accent-color": "#FF7DB0",
        }),
    },
    {
        name: "Matcha",
        colors: buildPreset("#3f6b2a", ["#e8efd9", "#d8e3c2", "#c6d4a8"], "#25331b", {
            "--title-accent-color": "#2a4a1a",
            "--visualizer-accent-color": "#6a994e",
        }),
    },
    {
        name: "Lilac",
        colors: buildPreset("#7048b8", ["#f1ecf8", "#e5ddf1", "#d7cbe6"], "#2e2640", {
            "--title-accent-color": "#4f2f8a",
            "--visualizer-accent-color": "#9b7fd4",
        }),
    },
    {
        name: "Vanilla",
        colors: buildPreset("#e49400", ["#fdf3d8", "#f8e6b8", "#f0d796"], "#5c3d0a", {
            "--title-accent-color": "#e49400",
            "--visualizer-accent-color": "#ffc400",
        }),
    },
];

function SettingsScreen({ onswitchToHomeScreen, onColorsChange }: {
    onswitchToHomeScreen: () => void;
    onColorsChange: (changes: Record<string, string>) => void;
}){

    const categories = ["Theme"];
    const [categoryIndex, setCategoryIndex] = useState(0);

    // current value of every setting, keyed by CSS variable name
    const [colors, setColors] = useState<Record<string, string>>(() =>
        Object.fromEntries(THEME_SETTINGS.map(s => [s.variable, getCssVariable(s.variable)]))
    );

    // applies a batch of changes: UI state, live CSS, and (via App) the preferences file
    function applyColors(changes: Record<string, string>) {
        setColors(prev => ({ ...prev, ...changes }));
        for (const [variable, hex] of Object.entries(changes)) {
            document.documentElement.style.setProperty(variable, hex);
        }
        onColorsChange(changes);
    }

    function changeColor(variable: string, hex: string) {
        const changes: Record<string, string> = { [variable]: hex };
        // the global setting also pushes its color to every setting under it
        if (variable === GLOBAL_ACCENT) {
            for (const setting of THEME_SETTINGS) {
                if (setting.underGlobal) changes[setting.variable] = hex;
            }
        }
        applyColors(changes);
    }

    // the preset whose colors all match the current ones (none = "Custom")
    const activePreset = THEME_PRESETS.find(preset =>
        Object.entries(preset.colors).every(
            ([variable, hex]) => colors[variable]?.toLowerCase() === hex.toLowerCase()
        )
    );

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent){
            if (event.code === "Escape"){
                console.log("escape");
                onswitchToHomeScreen();
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    })

    return (
        <div className="settings_screen_container">
            <div className="side_panel">
                <CursorList
                    className="category_list"
                    items={categories}
                    keyExtractor={(category) => category}
                    renderItem={(category, isSelected) => (
                        <div className="setting_category_item" style={{ color: isSelected ? "var(--settings-side-accent-color)" : "var(--text-color)" }}>
                            {category}
                        </div>
                    )}
                    selectedIndex={categoryIndex}
                    onSelectedIndexChange={setCategoryIndex}
                />
            </div>

            <div className="main_settings_panel">
                {categoryIndex===0 && (
                    <div className="theme_settings_container">

                        <div className="setting">
                            <div className="setting_label">Preset themes</div>
                            <div className="setting_filler" />
                            <div className="setting_control">
                                <select
                                    className="preset_select app_input"
                                    value={activePreset?.name ?? ""}
                                    onChange={(e) => {
                                        const preset = THEME_PRESETS.find(p => p.name === e.target.value);
                                        if (preset) applyColors(preset.colors);
                                        e.target.blur();   // hand the keyboard back to the app's shortcuts
                                    }}
                                    // keep typing in the dropdown away from the window shortcuts (Escape still leaves)
                                    onKeyDown={(e) => { if (e.key !== "Escape") e.stopPropagation(); }}
                                >
                                    <option value="" disabled>Custom</option>
                                    {THEME_PRESETS.map(preset => (
                                        <option key={preset.name} value={preset.name}>{preset.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {THEME_SETTINGS.map((setting) => (
                            <div className="setting" key={setting.variable}>
                                <div className={`setting_label ${setting.underGlobal ? "setting_label_indented" : ""}`}>{setting.label}</div>
                                <div className="setting_filler" />
                                <div className="setting_control">
                                    <PaletteColorPicker
                                        color={colors[setting.variable]}
                                        onChangeComplete={(color) => changeColor(setting.variable, color.hex)}
                                        palette={setting.palette}
                                    />
                                </div>
                                
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )

}

export {SettingsScreen, THEME_PRESETS};