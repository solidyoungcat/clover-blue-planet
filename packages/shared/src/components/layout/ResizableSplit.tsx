import React, { useState, useCallback, useRef, type ReactNode } from "react";

interface ResizableSplitProps {
  left: ReactNode;
  right: ReactNode;
  defaultRatio?: number;
}

export function ResizableSplit({ left, right, defaultRatio = 70 }: ResizableSplitProps) {
  const [ratio, setRatio] = useState(defaultRatio);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const onMouseDown = useCallback(() => {
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newRatio = ((e.clientX - rect.left) / rect.width) * 100;
      if (newRatio > 30 && newRatio < 85) setRatio(newRatio);
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);

  return (
    <div ref={containerRef} className="flex flex-1 min-h-0 overflow-hidden">
      <div style={{ width: `${ratio}%` }} className="min-h-0 flex flex-col">
        {left}
      </div>
      <div
        onMouseDown={onMouseDown}
        className="w-1.5 bg-ocean-800 hover:bg-ocean-400 cursor-col-resize shrink-0 transition-colors"
      />
      <div style={{ width: `${100 - ratio}%` }} className="min-h-0 flex flex-col">
        {right}
      </div>
    </div>
  );
}
