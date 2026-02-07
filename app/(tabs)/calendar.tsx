import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useStore } from '@/store/useStore';
import { Task } from '@/types';
import { format, isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

export default function CalendarScreen() {
  const { tasks, settings } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const isDark = settings.isDarkMode;
  const theme = {
    background: isDark ? '#1a1a1a' : '#f5f5f5',
    text: isDark ? '#ffffff' : '#000000',
    card: isDark ? '#2a2a2a' : '#ffffff',
    accent: '#4a7c2a',
    secondary: isDark ? '#666' : '#999',
    border: isDark ? '#333' : '#ddd',
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad calendar to start on Sunday
  const firstDayOfWeek = getDay(monthStart);
  const paddingDays = Array.from({ length: firstDayOfWeek }, (_, i) => null);

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      try {
        return isSameDay(parseISO(task.dueDate), date);
      } catch {
        return false;
      }
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newDate);
  };

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const selectedTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  const renderDay = (date: Date | null, index: number) => {
    if (!date) {
      return <View style={styles.dayCell} />;
    }

    const dayTasks = getTasksForDate(date);
    const isToday = isSameDay(date, new Date());
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const completedCount = dayTasks.filter((t) => t.completed).length;
    const totalCount = dayTasks.length;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayCell,
          isToday && { backgroundColor: theme.accent + '20' },
          isSelected && { backgroundColor: theme.accent + '40' },
        ]}
        onPress={() => setSelectedDate(date)}
      >
        <Text
          style={[
            styles.dayNumber,
            { color: theme.text },
            isToday && { fontWeight: 'bold', color: theme.accent },
          ]}
        >
          {format(date, 'd')}
        </Text>
        {totalCount > 0 && (
          <View style={styles.taskIndicator}>
            <View
              style={[
                styles.taskDot,
                {
                  backgroundColor:
                    completedCount === totalCount ? theme.accent : theme.secondary,
                },
              ]}
            />
            <Text style={[styles.taskCount, { color: theme.secondary }]}>
              {completedCount}/{totalCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Calendar Header */}
      <View style={[styles.calendarHeader, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigateMonth('prev')}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.monthTitle, { color: theme.text }]}>
          {format(currentMonth, 'MMMM yyyy')}
        </Text>
        <TouchableOpacity onPress={() => navigateMonth('next')}>
          <Ionicons name="chevron-forward" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Weekday Labels */}
      <View style={styles.weekdayRow}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <View key={day} style={styles.weekdayCell}>
            <Text style={[styles.weekdayText, { color: theme.secondary }]}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {[...paddingDays, ...daysInMonth].map((date, index) =>
          renderDay(date, index)
        )}
      </View>

      {/* Selected Date Tasks */}
      {selectedDate && (
        <View style={[styles.tasksContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.tasksTitle, { color: theme.text }]}>
            Tasks for {format(selectedDate, 'MMMM d, yyyy')}
          </Text>
          {selectedTasks.length === 0 ? (
            <Text style={[styles.noTasksText, { color: theme.secondary }]}>
              No tasks for this day
            </Text>
          ) : (
            <FlatList
              data={selectedTasks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.taskItem}>
                  <Ionicons
                    name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={item.completed ? theme.accent : theme.secondary}
                  />
                  <Text
                    style={[
                      styles.taskItemText,
                      { color: theme.text },
                      item.completed && styles.taskCompleted,
                    ]}
                  >
                    {item.title}
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  weekdayRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    margin: 2,
  },
  dayNumber: {
    fontSize: 16,
  },
  taskIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 2,
  },
  taskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  taskCount: {
    fontSize: 10,
  },
  tasksContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    maxHeight: 300,
  },
  tasksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noTasksText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  taskItemText: {
    fontSize: 14,
    flex: 1,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
});
