import React, { useState, FormEvent, useMemo } from 'react';
import { TASKS, BADGES, ACHIEVEMENT_CRITERIA } from '../constants';
import { Task, Badge, UserAchievement } from '../types';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import AchievementToast from './AchievementToast';

interface TasksDashboardProps {
  onBack: () => void;
  achievements: UserAchievement[];
  onAwardBadge: (badge: Badge) => boolean;
}

const formatDate = (dateString: string): { text: string, colorClass: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date
    const dueDate = new Date(dateString);
    // The dueDate from the input is timezone-agnostic (YYYY-MM-DD), 
    // but `new Date(string)` interprets it as UTC midnight.
    // Adjust for the user's timezone offset to compare correctly.
    dueDate.setMinutes(dueDate.getMinutes() + dueDate.getTimezoneOffset());
    dueDate.setHours(0, 0, 0, 0);
  
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
    if (diffDays < 0) {
      return { text: 'Overdue', colorClass: 'text-red-400' };
    }
    if (diffDays === 0) {
      return { text: 'Due Today', colorClass: 'text-yellow-400' };
    }
    if (diffDays === 1) {
        return { text: 'Due Tomorrow', colorClass: 'text-muted-gray' };
    }
    return { text: `Due ${dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`, colorClass: 'text-muted-gray' };
};


const TaskItem: React.FC<{
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}> = ({ task, onToggle, onDelete }) => {
  const dueDateInfo = task.dueDate ? formatDate(task.dueDate) : null;

  return (
    <li className="group flex items-center justify-between p-4 bg-slate-800/40 border border-slate-700 rounded-lg transition-all duration-300 hover:border-aqua-green/70 hover:bg-slate-800/80">
      <div className="flex items-center gap-4">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          className="h-5 w-5 rounded bg-slate-700 border-slate-600 text-electric-blue focus:ring-electric-blue focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 cursor-pointer flex-shrink-0"
          aria-labelledby={`task-${task.id}`}
        />
        <div>
          <span id={`task-${task.id}`} className={`text-white transition-colors ${task.completed ? 'line-through text-muted-gray' : ''}`}>
            {task.text}
          </span>
          {dueDateInfo && !task.completed && (
             <p className={`text-xs font-medium mt-1 ${dueDateInfo.colorClass}`}>{dueDateInfo.text}</p>
          )}
        </div>
      </div>
      <button
        onClick={() => onDelete(task.id)}
        className="text-muted-gray/50 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity ml-2"
        aria-label={`Delete task: ${task.text}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
      </button>
    </li>
  );
};


const TasksDashboard: React.FC<TasksDashboardProps> = ({ onBack, onAwardBadge }) => {
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [newTaskText, setNewTaskText] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [unlockedBadge, setUnlockedBadge] = useState<Badge | null>(null);


  const completedCount = useMemo(() => tasks.filter(t => t.completed).length, [tasks]);
  const progress = useMemo(() => tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0, [completedCount, tasks]);

  const sortedTasks = useMemo(() => {
    const incomplete = tasks.filter(t => !t.completed);
    const completed = tasks.filter(t => t.completed);
    
    incomplete.sort((a, b) => {
      if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (a.dueDate) return -1; // a has due date, b doesn't -> a comes first
      if (b.dueDate) return 1;  // b has due date, a doesn't -> b comes first
      return 0; // neither have due dates
    });

    return [...incomplete, ...completed];
  }, [tasks]);

  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    const trimmedText = newTaskText.trim();
    if (trimmedText) {
      const newTask: Task = {
        id: Date.now(),
        text: trimmedText,
        completed: false,
        dueDate: newDueDate || null,
      };
      setTasks(prevTasks => [newTask, ...prevTasks]);
      setNewTaskText('');
      setNewDueDate('');
    }
  };

  const handleToggleTask = (id: number) => {
    let newTasks: Task[] = [];
    setTasks(prevTasks => {
      newTasks = prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      );

      const toggledTask = prevTasks.find(t => t.id === id);
      const isCompletingTask = toggledTask && !toggledTask.completed;

      if (isCompletingTask) {
        const newCompletedCount = newTasks.filter(t => t.completed).length;
        const totalTasks = newTasks.length;
        
        BADGES.forEach(badge => {
          const criteriaFn = ACHIEVEMENT_CRITERIA[badge.id];
          if (criteriaFn && criteriaFn(newCompletedCount, totalTasks)) {
            const wasAwarded = onAwardBadge(badge);
            if (wasAwarded) {
              setUnlockedBadge(badge);
              setTimeout(() => setUnlockedBadge(null), 5000); // Auto-hide toast
            }
          }
        });
      }
      
      return newTasks;
    });
  };

  const handleDeleteTask = (id: number) => {
    setTaskToDelete(id);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete === null) return;
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete));
    setTaskToDelete(null);
  };

  const handleCancelDelete = () => {
    setTaskToDelete(null);
  };

  return (
    <div className="animate-slide-in-fade max-w-3xl mx-auto">
      <button onClick={onBack} className="mb-6 flex items-center text-sm font-medium text-muted-gray hover:text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Dashboard
      </button>

      <div className="bg-slate-900/30 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-2xl shadow-electric-blue/10">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-electric-blue/20 text-electric-blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">My Learning Tasks</h1>
            <p className="text-muted-gray">Stay on track with your goals.</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
            <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-white">Overall Progress</span>
                <span className="text-sm font-medium text-aqua-green">{completedCount} / {tasks.length} Completed</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-electric-blue to-aqua-green h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
        </div>


        {/* Add Task Form */}
        <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="e.g., Read documentation on Gemini API"
            className="flex-grow w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none transition"
          />
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="flex-shrink-0 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none transition"
            min={new Date().toISOString().split('T')[0]}
          />
          <button
            type="submit"
            className="flex-shrink-0 px-6 py-3 font-semibold rounded-lg text-white bg-gradient-to-r from-electric-blue to-neon-purple transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-dark-slate focus:ring-electric-blue disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!newTaskText.trim()}
          >
            Add Task
          </button>
        </form>

        {/* Task List */}
        <div>
          {tasks.length > 0 ? (
             <ul className="space-y-3">
              {sortedTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </ul>
          ) : (
            <div className="text-center py-10">
                <p className="text-muted-gray">You have no tasks yet. Add one to get started!</p>
            </div>
          )}
        </div>
      </div>
      {unlockedBadge && <AchievementToast badge={unlockedBadge} onClose={() => setUnlockedBadge(null)} />}
      {taskToDelete !== null && (
        <ConfirmDeleteModal 
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default TasksDashboard;