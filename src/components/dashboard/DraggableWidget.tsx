
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { GripVertical, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DraggableWidgetProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  onRemove?: (id: string) => void;
  onSettings?: (id: string) => void;
  draggable?: boolean;
}

const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  id,
  children,
  className,
  onRemove,
  onSettings,
  draggable = true
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    if (draggedId && draggedId !== id) {
      // Handle widget reordering logic here
      console.log(`Moving ${draggedId} to position of ${id}`);
    }
  };

  return (
    <div
      className={cn(
        "relative group transition-all duration-200",
        isDragging && "opacity-50 scale-95",
        className
      )}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Widget Controls */}
      {showControls && draggable && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onSettings && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 bg-background/80 backdrop-blur-sm"
              onClick={() => onSettings(id)}
            >
              <Settings className="h-3 w-3" />
            </Button>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 bg-background/80 backdrop-blur-sm text-destructive hover:text-destructive"
              onClick={() => onRemove(id)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <div className="h-6 w-6 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded cursor-grab active:cursor-grabbing">
            <GripVertical className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      )}

      {children}
    </div>
  );
};

export default DraggableWidget;
