import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useStore } from '../../store/useStore';
import Tree from '../../components/Tree';
import { getMotivationalMessage } from '../../utils/treeUtils';
import { isToday, parseISO } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function TreeScreen() {
  const { treeState, tasks, loadData, settings } = useStore();

  useEffect(() => {
    loadData();
    SplashScreen.hideAsync?.().catch(() => {});
  }, []);

  const hasTasksToday = tasks.some((task) => {
    if (!task.dueDate) return false;
    try {
      return isToday(parseISO(task.dueDate));
    } catch {
      return false;
    }
  });

  const message = getMotivationalMessage(treeState, hasTasksToday);
  const isDark = settings?.isDarkMode ?? false;

  const theme = {
    background: isDark ? '#1a1a1a' : '#f5f5f5',
    text: isDark ? '#ffffff' : '#000000',
    card: isDark ? '#2a2a2a' : '#ffffff',
    accent: '#4a7c2a',
    secondary: isDark ? '#666' : '#999',
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Strom růstu</Text>
        <Text style={[styles.subtitle, { color: theme.secondary }]}>
          Úroveň {treeState.level}
        </Text>
      </View>

      {/* Tree Container */}
      <View style={styles.treeWrapper}>
        <Tree treeState={treeState} />
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Ionicons name="leaf" size={24} color={theme.accent} />
          <Text style={[styles.statValue, { color: theme.text }]}>
            {treeState.leaves}
          </Text>
          <Text style={[styles.statLabel, { color: theme.secondary }]}>
            Listy
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Ionicons name="flame" size={24} color="#FF6B35" />
          <Text style={[styles.statValue, { color: theme.text }]}>
            {treeState.streak}
          </Text>
          <Text style={[styles.statLabel, { color: theme.secondary }]}>
            Série dní
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Ionicons name="star" size={24} color="#FFD700" />
          <Text style={[styles.statValue, { color: theme.text }]}>
            {treeState.growthPoints}
          </Text>
          <Text style={[styles.statLabel, { color: theme.secondary }]}>
            Body růstu
          </Text>
        </View>
      </View>

      {/* Motivational Message */}
      <View style={[styles.messageCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.messageText, { color: theme.text }]}>
          {message}
        </Text>
      </View>

      {/* Stage Info */}
      <View style={[styles.stageCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.stageTitle, { color: theme.text }]}>
          Aktuální fáze
        </Text>
        <Text style={[styles.stageValue, { color: theme.accent }]}>
          {treeState.currentStage === 'seed' ? 'Semeno' : treeState.currentStage === 'sprout' ? 'Klíček' : treeState.currentStage === 'small-tree' ? 'Malý strom' : treeState.currentStage === 'big-tree' ? 'Velký strom' : 'Kvetoucí strom'}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((treeState.level % 10) / 10) * 100}%`,
                backgroundColor: theme.accent,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: theme.secondary }]}>
          {treeState.level % 10} / 10 do další úrovně
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
  },
  treeWrapper: {
    height: 300,
    width: '100%',
    marginVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 5,
  },
  messageCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  stageCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stageTitle: {
    fontSize: 14,
    marginBottom: 5,
  },
  stageValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
  },
});
