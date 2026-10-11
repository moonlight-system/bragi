import "./CursorList.css";
import { useState, useEffect, useRef } from 'react';

// one text field of an item that can be edited in place
interface EditableField<T> {
    id: string;                                 // e.g. "name" or "artist"
    key: string;                                // key that starts editing it, e.g. "r"
    onCommit: (item: T, newValue: string) => void;
}

// handed to renderItem so an item can show an input instead of its label
type ItemEditor = {
    field: string | null;                       // field being edited on this item (null = none)
    commit: (newValue: string) => void;
    cancel: () => void;
};

interface CursorListProps<T>{
    className?: string;
    items: T[];
    keyExtractor: (item: T) => string;
    renderItem: (item: T, isSelected: boolean, editor: ItemEditor) => React.ReactNode;
    selectedIndex: number;
    onSelectedIndexChange: (index: number) => void;
    onActivate?: (item: T) => void;
    onCreate?: (name: string) => void;
    onDelete?: (item: T) => void;
    editableFields?: EditableField<T>[];
    onReorder?: (item: T, direction: "up" | "down") => void;
    onModeChange?: (mode: "idle" | "creating" | "renaming") => void;
    enabled?: boolean;
}

function CursorList<T>({
    className,
    items,
    keyExtractor,
    renderItem,
    selectedIndex,
    onSelectedIndexChange,
    onActivate,
    onCreate,
    onDelete,
    editableFields,
    onReorder,
    onModeChange,
    enabled = true,
}: CursorListProps<T>){
    const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [cursorTop, setCursorTop] = useState(0);
    const [mode, setMode] = useState<"idle" | "creating" | "renaming">("idle");
    const [editingField, setEditingField] = useState<string | null>(null);
    const [textInput, setTextInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const selectedRow = rowRefs.current[selectedIndex];
        if (selectedRow) {
            setCursorTop(selectedRow.offsetTop);
        }
    }, [selectedIndex, items, mode]);

    useEffect(() => {
        if (mode === "creating") inputRef.current?.focus();
        onModeChange?.(mode);
    }, [mode]);

    useEffect(() => {
        const selectedRow = rowRefs.current[selectedIndex];
        if (selectedRow) {
            selectedRow.scrollIntoView({ block: "nearest" });
        }
    }, [selectedIndex, items]);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (!enabled) return;
            const editField = editableFields?.find(f => f.key === event.key);

            if (mode !== "idle") {
                if (mode === "creating") {
                    if (event.key === "Enter") {
                        const trimmed = textInput.trim();
                        if (trimmed.length > 0) onCreate?.(trimmed);
                        setMode("idle");
                    } else if (event.key === "Escape") {
                        setMode("idle");
                    }
                }
                return;
            }

            if (event.shiftKey && event.code === "ArrowUp" && onReorder && selectedIndex > 0) {
                event.preventDefault();
                onReorder(items[selectedIndex], "up");
                onSelectedIndexChange(selectedIndex - 1);
            } else if (event.shiftKey && event.code === "ArrowDown" && onReorder && selectedIndex < items.length - 1) {
                event.preventDefault();
                onReorder(items[selectedIndex], "down");
                onSelectedIndexChange(selectedIndex + 1);
            } else if (event.code === "ArrowUp" && items.length > 0) {
                onSelectedIndexChange(selectedIndex <= 0 ? items.length - 1 : selectedIndex - 1);
            } else if (event.code === "ArrowDown" && items.length > 0) {
                onSelectedIndexChange(selectedIndex >= items.length - 1 ? 0 : selectedIndex + 1);
            } else if (event.key === "n" && onCreate) {
                event.preventDefault();
                setTextInput("");
                setMode("creating");
            } else if (editField && items.length > 0) {
                event.preventDefault();
                setEditingField(editField.id);
                setMode("renaming");
            } else if (event.key === "x" && onDelete && items.length > 0) {
                onDelete(items[selectedIndex]);
            } else if (event.key === "Enter" && onActivate && items.length > 0) {
                onActivate(items[selectedIndex]);
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [enabled, mode, items, selectedIndex, textInput, onSelectedIndexChange, onActivate, editableFields, onDelete, onCreate, onReorder]);

    const cursorOpacity = items.length === 0 ? '0%' : enabled ? '100%' : '35%';

    function stopEditing() {
        setEditingField(null);
        setMode("idle");
    }

    function commitEdit(newValue: string) {
        const field = editableFields?.find(f => f.id === editingField);
        const trimmed = newValue.trim();
        if (field && trimmed.length > 0 && items[selectedIndex]) {
            field.onCommit(items[selectedIndex], trimmed);
        }
        stopEditing();
    }

    return(
        <div className={`${className} cursor_list_wrapper`}>
            {onCreate && (<div style={{opacity: mode !== "idle" ? '100%' : '0%'}} className="new_label rendered_item">New name:
                <input
                className="new_label_input app_input"
                ref={inputRef}
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                />
            </div>)}

            <div className="cursor_list_scroll">
                <div className="cursor_list_inner">
                    <div
                        className="cursor"
                        style={{ transform: `translateY(${cursorTop}px)`, opacity: cursorOpacity }}
                    >{'>'}</div>

                    <div className="cursor_list">
                        {items.map((item, index) => (
                            <div
                            className="rendered_item"
                            ref={(el) => { rowRefs.current[index] = el; }}
                            key={keyExtractor(item)}
                            onClick={() => {
                                if (mode !== "idle") return;
                                onSelectedIndexChange(index);
                                onActivate?.(item);
                            }}>
                            {renderItem(item, index === selectedIndex, {
                                field: mode === "renaming" && index === selectedIndex ? editingField : null,
                                commit: commitEdit,
                                cancel: stopEditing,
                            })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export { CursorList };
export type { ItemEditor, EditableField };