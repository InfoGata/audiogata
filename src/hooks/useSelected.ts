import React from "react";
import { Track } from "../plugintypes";
import { CheckedState } from "@radix-ui/react-checkbox";

const useSelected = (tracks: Track[]) => {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const lastSelected = React.useRef<number | null>(null);

  const onSelect = (e: React.MouseEvent, id: string, index: number) => {
    const isChecked = !selected.has(id);
    if (
      lastSelected.current !== null &&
      (e.nativeEvent as any).shiftKey &&
      isChecked
    ) {
      setSelected((prev) => {
        const next = new Set(prev);
        const start = Math.min(lastSelected.current || 0, index);
        const end = Math.max(lastSelected.current || 0, index) + 1;
        const ids = tracks.slice(start, end).map((t) => t.id);
        ids?.forEach((id) => next.add(id || ""));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        if (isChecked) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });
    }
    lastSelected.current = isChecked ? index : null;
  };

  const onSelectAll = (state: CheckedState) => {
    if (state) {
      setSelected(new Set(tracks.map((t) => t.id || "")));
      return;
    }
    setSelected(new Set());
  };

  const isSelected = (id: string) => {
    return selected.has(id);
  };

  return { selected, setSelected, onSelect, onSelectAll, isSelected };
};

export default useSelected;
