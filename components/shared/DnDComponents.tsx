import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  data?: any;
}

export const SortableItem: React.FC<SortableItemProps> = ({ id, children, data }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id, data });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

interface DroppableColumnProps {
  id: string;
  children: React.ReactNode;
  title: string;
  count: number;
    color: string;
    textColor: string;
}

export const DroppableColumn: React.FC<DroppableColumnProps> = ({ id, children, title, count, color, textColor }) => {
  const { setNodeRef, isOver } = useDroppable({
    id
  });

  return (
    <div ref={setNodeRef} className={`bg-gray-100 rounded-lg w-full md:w-72 flex-shrink-0 ${isOver ? 'ring-2 ring-purple-400 bg-purple-50' : ''}`}>
        <div className={`p-3 flex justify-between items-center rounded-t-lg ${color}`}>
            <h3 className={`font-semibold ${textColor} text-sm`}>{title}</h3>
            <span className={`${textColor} text-sm font-bold bg-black/10 rounded-full px-2 py-0.5`}>{count}</span>
        </div>
        <div className="p-2 h-full overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            {children}
        </div>
    </div>
  );
};
