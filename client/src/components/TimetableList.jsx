import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CheckCircle, Circle, GripVertical, Trash2, Edit } from 'lucide-react';
import axios from 'axios';

// Sortable Item Component
const SortableBlock = ({ block, toggleComplete, deleteBlock }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: block._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'border-red-400 bg-red-50';
      case 'Medium': return 'border-yellow-400 bg-yellow-50';
      case 'Low': return 'border-green-400 bg-green-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative rounded-xl border-l-4 shadow-sm p-4 flex items-center gap-4 transition-all ${getPriorityColor(block.priority)} ${block.completed ? 'opacity-60 grayscale' : 'hover:shadow-md'}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
        <GripVertical size={20} />
      </div>

      <button onClick={() => toggleComplete(block._id, block.completed)} className="text-indigo-500 hover:text-indigo-600 transition-colors">
        {block.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 w-full sm:w-auto overflow-hidden">
            <span className="text-sm font-bold bg-white/60 px-2 py-1 rounded text-gray-700 whitespace-nowrap">{block.start_time} - {block.end_time}</span>
            <span className={`font-semibold text-lg truncate w-full sm:w-auto ${block.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{block.title}</span>
          </div>
          <span className="text-[10px] sm:text-xs font-medium text-gray-500 bg-white/50 px-2 py-1 rounded-full uppercase tracking-wider whitespace-nowrap hidden sm:block">{block.category}</span>
        </div>
        {block.notes && (
          <p className="text-sm text-gray-600 mt-2 ml-1">{block.notes}</p>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
         {/* Edit functionality omitted for simplicity, but delete is here */}
         <button onClick={() => deleteBlock(block._id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
           <Trash2 size={18} />
         </button>
      </div>
    </div>
  );
};

const TimetableList = ({ blocks, setBlocks, toggleComplete, deleteBlock }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b._id === active.id);
      const newIndex = blocks.findIndex(b => b._id === over.id);
      
      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      
      // Update order mathematically 
      const updatedBlocks = newBlocks.map((b, index) => ({ ...b, order: index }));
      setBlocks(updatedBlocks);

      try {
         // Batch update order on server
         await axios.put('/api/timetable/reorder/batch', {
            blocks: updatedBlocks.map(b => ({ id: b._id, order: b.order, start_time: b.start_time, end_time: b.end_time }))
         });
      } catch (err) {
         console.error('Failed to save reorder');
      }
    }
  };

  if (!blocks || blocks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
        <p className="text-lg">No time blocks for this day.</p>
        <p className="text-sm mt-2">Click "Add Time Block" to get started.</p>
      </div>
    );
  }

  // Sort blocks by order field, fallback to start_time if order is 0 (default)
  const sortedBlocks = [...blocks].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.start_time.localeCompare(b.start_time);
  });

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={sortedBlocks.map(b => b._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {sortedBlocks.map(block => (
            <SortableBlock 
              key={block._id} 
              block={block} 
              toggleComplete={toggleComplete}
              deleteBlock={deleteBlock}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default TimetableList;
