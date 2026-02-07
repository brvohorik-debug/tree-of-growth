import { Task, TreeState } from '@/types';
import { differenceInDays, isToday, parseISO } from 'date-fns';

export function calculateTreeState(
  tasks: Task[],
  currentState: TreeState
): TreeState {
  const completedTasks = tasks.filter((t) => t.completed);
  const totalCompleted = completedTasks.length;
  
  // Calculate growth points (1 point per completed task, bonus for high priority)
  const growthPoints = completedTasks.reduce((points, task) => {
    let taskPoints = 1;
    if (task.priority === 'high') taskPoints = 3;
    else if (task.priority === 'medium') taskPoints = 2;
    return points + taskPoints;
  }, 0);

  // Calculate level (every 10 growth points = 1 level)
  const level = Math.floor(growthPoints / 10) + 1;

  // Determine tree stage based on level
  let currentStage: TreeState['currentStage'] = 'seed';
  if (level >= 20) currentStage = 'blooming-tree';
  else if (level >= 15) currentStage = 'big-tree';
  else if (level >= 10) currentStage = 'small-tree';
  else if (level >= 5) currentStage = 'sprout';
  else currentStage = 'seed';

  // Calculate leaves (1 leaf per completed task, max 100 visible)
  const leaves = Math.min(totalCompleted, 100);

  // Calculate streak
  const streak = calculateStreak(completedTasks);

  // Find last completed date
  const completedDates = completedTasks
    .map((t) => t.completedAt)
    .filter((d): d is string => !!d)
    .sort()
    .reverse();
  const lastCompletedDate = completedDates[0];

  return {
    growthPoints,
    level,
    currentStage,
    leaves,
    totalCompleted,
    streak,
    lastCompletedDate,
  };
}

export function calculateStreak(tasks: Task[]): number {
  const completedTasks = tasks
    .filter((t) => t.completed && t.completedAt)
    .map((t) => parseISO(t.completedAt!))
    .sort((a, b) => b.getTime() - a.getTime());

  if (completedTasks.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Check if today has a completed task
  const todayHasTask = completedTasks.some((date) => isToday(date));
  if (!todayHasTask) {
    // If no task today, check yesterday
    currentDate.setDate(currentDate.getDate() - 1);
  }

  for (const taskDate of completedTasks) {
    const taskDateOnly = new Date(taskDate);
    taskDateOnly.setHours(0, 0, 0, 0);

    const daysDiff = differenceInDays(currentDate, taskDateOnly);

    if (daysDiff === 0 || daysDiff === 1) {
      streak++;
      currentDate = taskDateOnly;
    } else {
      break;
    }
  }

  return streak;
}

export function getMotivationalMessage(
  treeState: TreeState,
  hasTasksToday: boolean
): string {
  const { streak, level, currentStage } = treeState;

  if (streak === 0 && !hasTasksToday) {
    return "🌱 Plant the seed of your growth today!";
  }

  if (streak >= 7) {
    return `🔥 Amazing ${streak}-day streak! Keep it growing!`;
  }

  if (streak >= 3) {
    return `✨ Great ${streak}-day streak! Your tree is thriving!`;
  }

  if (level >= 20) {
    return "🌸 Your tree is blooming beautifully!";
  }

  if (level >= 15) {
    return "🌳 Your tree has grown so strong!";
  }

  if (level >= 10) {
    return "🌿 Your tree is growing well!";
  }

  if (hasTasksToday) {
    return "💚 Complete tasks to help your tree grow!";
  }

  return "🌱 Your tree needs care today.";
}
