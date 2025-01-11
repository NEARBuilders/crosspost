import { useEffect, useState } from "react";
import { DndContext, useDraggable } from "@dnd-kit/core";
import { ProfileHighlight } from "./social/profile-highlight";

function DraggableProfileHighlight({ position }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "profile-highlight",
  });

  const helperAccount = "davidmo.near";
  const helperContent = '"NEAR is the blockchain for AI!"';

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 50,
        cursor: "grab",
        touchAction: "none",
        ...style,
      }}
      {...listeners}
      {...attributes}
    >
      <ProfileHighlight
        accountId={helperAccount}
        tooltipContent={helperContent}
        size={64}
      />
    </div>
  );
}

export function HelperBuddy() {
  const [position, setPosition] = useState({ x: 16, y: 16 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPosition({
        x: 16,
        y: window.innerHeight - 48 - 48,
      });
    }
  }, []);

  const handleDragEnd = (event) => {
    const { delta } = event;
    setPosition((prev) => ({
      x: prev.x + delta.x,
      y: prev.y + delta.y,
    }));
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <DraggableProfileHighlight position={position} />
    </DndContext>
  );
}
