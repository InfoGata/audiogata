import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";
import { TableRow } from "./ui/table";

interface SortableItemProps {
  id: string;
  disabled?: boolean;
  onClick?: (...args: any) => void;
  currentItem?: boolean;
}
const SortableRow: React.FC<React.PropsWithChildren<SortableItemProps>> = (
  props
) => {
  const { id, onClick, disabled, currentItem } = props;
  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: id || "", disabled: disabled });

  return (
    <TableRow
      onClick={onClick}
      style={{
        position: "relative",
        zIndex: isDragging ? 1 : undefined,
        transform: CSS.Translate.toString(transform),
        transition,
        touchAction: "none",
        opacity: isDragging ? 0.3 : 1,
      }}
      className={cn(currentItem && "bg-muted")}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      {props.children}
    </TableRow>
  );
};

export default SortableRow;
