import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Grid } from "@mui/material";

interface SortableItemProps {
  id: string;
  as?: React.ComponentType<any>;
}
const SortableItem: React.FC<SortableItemProps> = (props) => {
  const { id, as } = props;
  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: id || "" });
  const Component = as || Grid;
  return (
    <Component
      sx={{
        position: "relative",
        zIndex: isDragging ? 1 : undefined,
        transform: CSS.Translate.toString(transform),
        transition,
        touchAction: "none",
        opacity: isDragging ? 0.3 : 1,
      }}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      {props.children}
    </Component>
  );
};

export default SortableItem;
