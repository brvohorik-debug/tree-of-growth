import React, { Component, useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { useStore } from '../../store/useStore';
import { Task, TaskCategory, TaskPriority } from '../../types';
import { Ionicons } from '@expo/vector-icons';

const DAYS_CZ = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
const MONTHS_CZ = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];

function InlineCalendar({
  value,
  onChange,
  theme,
}: {
  value: string;
  onChange: (dateStr: string) => void;
  theme: { background: string; text: string; accent: string; border: string };
}) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const d = new Date(value);
      return isNaN(d.getTime()) ? new Date() : d;
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
      }
    }
  }, [value]);

  const { year, month, days } = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const firstDay = (first.getDay() + 6) % 7;
    const dayCount = last.getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= dayCount; i++) days.push(i);
    return { year: y, month: m, days };
  }, [viewDate]);

  const selectedDate = value ? new Date(value) : null;
  const isSelected = (day: number) =>
    selectedDate &&
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === month &&
    selectedDate.getFullYear() === year;
  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

  const pick = (day: number) => {
    const d = new Date(year, month, day);
    onChange(d.toISOString().split('T')[0]);
  };

  const prevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1));
  const nextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1));

  return (
    <View style={[styles.calendarWrap, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={prevMonth} style={styles.calendarNav}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.calendarTitle, { color: theme.text }]}>
          {MONTHS_CZ[month]} {year}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={styles.calendarNav}>
          <Ionicons name="chevron-forward" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.calendarWeekdays}>
        {DAYS_CZ.map((d) => (
          <Text key={d} style={[styles.calendarWeekday, { color: theme.text }]}>{d}</Text>
        ))}
      </View>
      <View style={styles.calendarGrid}>
        {days.map((day, i) =>
          day === null ? (
            <View key={`e-${i}`} style={styles.calendarDay} />
          ) : (
            <TouchableOpacity
              key={day}
              style={[
                styles.calendarDay,
                isSelected(day) && { backgroundColor: theme.accent },
                isToday(day) && !isSelected(day) && { borderWidth: 2, borderColor: theme.accent },
              ]}
              onPress={() => pick(day)}
            >
              <Text
                style={[
                  styles.calendarDayText,
                  { color: theme.text },
                  isSelected(day) && { color: '#fff' },
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
}

class TasksErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError = () => ({ hasError: true });
  render() {
    if (this.state.hasError) {
      return (
        <View style={[styles.container, styles.errorContainer]}>
          <Ionicons name="warning-outline" size={48} color="#FF6B35" />
          <Text style={styles.errorText}>Nepodařilo se načíst úkoly</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => this.setState({ hasError: false })}
          >
            <Text style={styles.retryButtonText}>Zkusit znovu</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

function formatTaskDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

export default function TasksScreen() {
  const tasks = useStore((s) => s.tasks ?? []);
  const addTask = useStore((s) => s.addTask);
  const updateTask = useStore((s) => s.updateTask);
  const deleteTask = useStore((s) => s.deleteTask);
  const toggleTask = useStore((s) => s.toggleTask);
  const settings = useStore((s) => s.settings);
  const taskTemplates = useStore((s) => s.taskTemplates ?? []);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'daily' as TaskCategory,
    priority: 'medium' as TaskPriority,
    dueDate: '',
    repeatPattern: undefined as 'daily' | 'weekly' | 'monthly' | undefined,
  });

  const isDark = settings?.isDarkMode ?? false;
  const theme = {
    background: isDark ? '#1a1a1a' : '#f5f5f5',
    text: isDark ? '#ffffff' : '#000000',
    card: isDark ? '#2a2a2a' : '#ffffff',
    accent: '#4a7c2a',
    secondary: isDark ? '#666' : '#999',
    border: isDark ? '#333' : '#ddd',
  };

  const openModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        category: task.category,
        priority: task.priority,
        dueDate: task.dueDate || '',
        repeatPattern: task.repeatPattern,
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        category: 'daily',
        priority: 'medium',
        dueDate: '',
        repeatPattern: undefined,
      });
    }
    setModalVisible(true);
  };

  const applyTemplate = (title: string, description?: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      description: description || prev.description,
    }));
  };

  const handleSave = () => {
    if (!formData.title.trim()) return;

    const payload = {
      title: formData.title.trim(),
      description: (formData.description || '').trim(),
      category: formData.category,
      priority: formData.priority,
      dueDate: (formData.dueDate || '').trim() || undefined,
      repeatPattern: formData.repeatPattern,
    };

    if (editingTask) {
      updateTask(editingTask.id, payload);
    } else {
      addTask(payload);
    }

    setModalVisible(false);
    setEditingTask(null);
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return '#FF6B35';
      case 'medium':
        return '#FFD700';
      case 'low':
        return '#4a7c2a';
      default:
        return '#4a7c2a';
    }
  };

  const getCategoryIcon = (category: TaskCategory) => {
    switch (category) {
      case 'daily':
        return 'calendar';
      case 'long-term':
        return 'flag';
      case 'habit':
        return 'repeat';
      default:
        return 'list';
    }
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={[styles.taskCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => openModal(item)}
    >
      <View style={styles.taskHeader}>
        <TouchableOpacity
          onPress={() => toggleTask(item.id)}
          style={styles.checkbox}
        >
          <Ionicons
            name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={item.completed ? theme.accent : theme.secondary}
          />
        </TouchableOpacity>
        <View style={styles.taskContent}>
          <Text
            style={[
              styles.taskTitle,
              { color: theme.text },
              item.completed && styles.taskCompleted,
            ]}
          >
            {item.title}
          </Text>
          {item.description && (
            <Text style={[styles.taskDescription, { color: theme.secondary }]}>
              {item.description}
            </Text>
          )}
          <View style={styles.taskMeta}>
            <View style={styles.taskBadge}>
              <Ionicons
                name={getCategoryIcon(item.category)}
                size={14}
                color={theme.accent}
              />
              <Text style={[styles.badgeText, { color: theme.accent }]}>
                {({ daily: 'Denní', 'long-term': 'Dlouhodobý', habit: 'Návyk' } as Record<TaskCategory, string>)[item.category] ?? item.category}
              </Text>
            </View>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(item.priority) + '20' },
              ]}
            >
              <View
                style={[
                  styles.priorityDot,
                  { backgroundColor: getPriorityColor(item.priority) },
                ]}
              />
              <Text
                style={[
                  styles.badgeText,
                  { color: getPriorityColor(item.priority) },
                ]}
              >
                {({ low: 'Nízká', medium: 'Střední', high: 'Vysoká' } as Record<TaskPriority, string>)[item.priority] ?? item.priority}
              </Text>
            </View>
            {item.dueDate ? (
              <Text style={[styles.dateText, { color: theme.secondary }]}>
                {formatTaskDate(item.dueDate)}
              </Text>
            ) : null}
            {item.repeatPattern && (
              <View style={styles.taskBadge}>
                <Ionicons name="repeat" size={14} color={theme.accent} />
                <Text style={[styles.badgeText, { color: theme.accent }]}>
                  {item.repeatPattern === 'daily' ? 'Denně' : item.repeatPattern === 'weekly' ? 'Týdně' : 'Měsíčně'}
                </Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => deleteTask(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color="#FF6B35" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <TasksErrorBoundary>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <FlatList
          data={tasks}
        renderItem={renderTask}
        keyExtractor={(item, index) => item?.id ?? `task-${index}`}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={64} color={theme.secondary} />
            <Text style={[styles.emptyText, { color: theme.secondary }]}>
              Zatím žádné úkoly. Přidej první a začni pěstovat svůj strom!
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.accent }]}
        onPress={() => openModal()}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editingTask ? 'Upravit úkol' : 'Nový úkol'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {taskTemplates.length > 0 && !editingTask && (
                <>
                  <Text style={[styles.label, { color: theme.text }]}>Rychlý výběr šablony</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesRow}>
                    {taskTemplates.map((tpl) => (
                      <TouchableOpacity
                        key={tpl.id}
                        style={[styles.templateChip, { backgroundColor: theme.background, borderColor: theme.border }]}
                        onPress={() => applyTemplate(tpl.title, tpl.description)}
                      >
                        <Text style={[styles.templateChipText, { color: theme.text }]} numberOfLines={1}>{tpl.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="Název úkolu"
                placeholderTextColor={theme.secondary}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />

              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { backgroundColor: theme.background, color: theme.text, borderColor: theme.border },
                ]}
                placeholder="Popis (volitelné)"
                placeholderTextColor={theme.secondary}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                multiline
                numberOfLines={3}
              />

              <Text style={[styles.label, { color: theme.text }]}>Kategorie</Text>
              <View style={styles.optionsRow}>
                {(['daily', 'long-term', 'habit'] as TaskCategory[]).map(
                  (cat) => {
                    const catLabels: Record<TaskCategory, string> = { daily: 'Denní', 'long-term': 'Dlouhodobý', habit: 'Návyk' };
                    return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor:
                            formData.category === cat
                              ? theme.accent
                              : theme.background,
                          borderColor: theme.border,
                        },
                      ]}
                      onPress={() => setFormData({ ...formData, category: cat })}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          {
                            color:
                              formData.category === cat ? '#fff' : theme.text,
                          },
                        ]}
                      >
                        {catLabels[cat]}
                      </Text>
                    </TouchableOpacity>
                  );
                  }
                )}
              </View>

              <Text style={[styles.label, { color: theme.text }]}>Priorita</Text>
              <View style={styles.optionsRow}>
                {(['low', 'medium', 'high'] as TaskPriority[]).map((pri) => {
                  const priLabels: Record<TaskPriority, string> = { low: 'Nízká', medium: 'Střední', high: 'Vysoká' };
                  return (
                  <TouchableOpacity
                    key={pri}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor:
                          formData.priority === pri
                            ? getPriorityColor(pri)
                            : theme.background,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() => setFormData({ ...formData, priority: pri })}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: formData.priority === pri ? '#fff' : theme.text,
                        },
                      ]}
                    >
                      {priLabels[pri]}
                    </Text>
                  </TouchableOpacity>
                );
                })}
              </View>

              <Text style={[styles.label, { color: theme.text }]}>Datum splnění</Text>
              <InlineCalendar
                value={formData.dueDate}
                onChange={(dateStr) => setFormData({ ...formData, dueDate: dateStr })}
                theme={theme}
              />
              {formData.dueDate ? (
                <TouchableOpacity
                  style={[styles.clearDateButton, { borderColor: theme.border }]}
                  onPress={() => setFormData({ ...formData, dueDate: '' })}
                >
                  <Ionicons name="close-circle" size={18} color={theme.secondary} />
                  <Text style={[styles.clearDateText, { color: theme.secondary }]}>Zrušit výběr data</Text>
                </TouchableOpacity>
              ) : null}

              <Text style={[styles.label, { color: theme.text }]}>Opakování</Text>
              <View style={styles.optionsRow}>
                {[
                  { val: undefined as const, label: 'Žádné' },
                  { val: 'daily' as const, label: 'Denně' },
                  { val: 'weekly' as const, label: 'Týdně' },
                  { val: 'monthly' as const, label: 'Měsíčně' },
                ].map(({ val, label }) => (
                  <TouchableOpacity
                    key={label}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: formData.repeatPattern === val ? theme.accent : theme.background,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() => setFormData({ ...formData, repeatPattern: val })}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: formData.repeatPattern === val ? '#fff' : theme.text },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.accent }]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Uložit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </TasksErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#4a7c2a',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  calendarWrap: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calendarNav: { padding: 4 },
  calendarTitle: { fontSize: 16, fontWeight: '600' },
  calendarWeekdays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarWeekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  calendarDayText: { fontSize: 14, fontWeight: '500' },
  clearDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 6,
  },
  clearDateText: { fontSize: 14 },
  templatesRow: { marginBottom: 12 },
  templateChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  templateChipText: { fontSize: 14 },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  taskCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  taskDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  taskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalBody: {
    maxHeight: 500,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  modalFooter: {
    marginTop: 20,
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
