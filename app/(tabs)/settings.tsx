import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useStore } from '../../store/useStore';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';

export default function SettingsScreen() {
  const { settings, updateSettings, exportData, importData, taskTemplates, addTemplate, deleteTemplate } = useStore();
  const [isExporting, setIsExporting] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');

  const isDark = settings.isDarkMode;
  const theme = {
    background: isDark ? '#1a1a1a' : '#f5f5f5',
    text: isDark ? '#ffffff' : '#000000',
    card: isDark ? '#2a2a2a' : '#ffffff',
    accent: '#4a7c2a',
    secondary: isDark ? '#666' : '#999',
    border: isDark ? '#333' : '#ddd',
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await exportData();
      const fileUri = `${FileSystem.documentDirectory}tree_of_growth_backup.json`;
      
      await FileSystem.writeAsStringAsync(fileUri, data);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export dat Stromu růstu',
        });
        Alert.alert('Úspěch', 'Data byla úspěšně exportována.');
      } else {
        Alert.alert('Export', `Data uložena do: ${fileUri}`);
      }
    } catch (error) {
      Alert.alert('Chyba', 'Export dat se nezdařil.');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = () => {
    Alert.alert(
      'Import dat',
      'Pro import uložte záložní soubor do úložiště zařízení a otevřete ho pomocí správce souborů ve Stromu růstu.',
      [{ text: 'OK' }]
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Smazat všechna data',
      'Tím se smažou všechny úkoly, obrázky a nastavení. Tuto akci nelze vrátit zpět.',
      [
        { text: 'Zrušit', style: 'cancel' },
        {
          text: 'Smazat',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all data
              await importData(JSON.stringify({
                tasks: [],
                treeState: {
                  growthPoints: 0,
                  level: 1,
                  currentStage: 'seed',
                  leaves: 0,
                  totalCompleted: 0,
                  streak: 0,
                },
                userImages: [],
                settings: settings,
                taskTemplates: [],
              }));
              Alert.alert('Úspěch', 'Všechna data byla smazána.');
            } catch (error) {
              Alert.alert('Chyba', 'Nepodařilo se smazat data.');
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({
    label,
    value,
    onPress,
    icon,
    rightComponent,
  }: {
    label: string;
    value?: string;
    onPress?: () => void;
    icon: string;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={24} color={theme.accent} />
        <View style={styles.settingText}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>
            {label}
          </Text>
          {value && (
            <Text style={[styles.settingValue, { color: theme.secondary }]}>
              {value}
            </Text>
          )}
        </View>
      </View>
      {rightComponent || (onPress && <Ionicons name="chevron-forward" size={20} color={theme.secondary} />)}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Vzhled
      </Text>

      <View style={[styles.settingCard, { backgroundColor: theme.card }]}>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="moon" size={24} color={theme.accent} />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                Tmavý režim
              </Text>
            </View>
          </View>
          <Switch
            value={settings.isDarkMode}
            onValueChange={(value) => updateSettings({ isDarkMode: value })}
            trackColor={{ false: theme.border, true: theme.accent + '80' }}
            thumbColor={settings.isDarkMode ? theme.accent : theme.secondary}
          />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Oznámení
      </Text>

      <View style={[styles.settingCard, { backgroundColor: theme.card }]}>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications" size={24} color={theme.accent} />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                Denní připomínky
              </Text>
              <Text style={[styles.settingValue, { color: theme.secondary }]}>
                Připomínka péče o strom
              </Text>
            </View>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(value) =>
              updateSettings({ notificationsEnabled: value })
            }
            trackColor={{ false: theme.border, true: theme.accent + '80' }}
            thumbColor={
              settings.notificationsEnabled ? theme.accent : theme.secondary
            }
          />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Šablony úkolů
      </Text>
      <View style={[styles.settingCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.templateHint, { color: theme.secondary }]}>
          Šablony se zobrazí při vytváření úkolu – klepnutím vyplníte název a popis.
        </Text>
        {(taskTemplates ?? []).map((tpl) => (
          <View key={tpl.id} style={[styles.templateRow, { borderColor: theme.border }]}>
            <View style={styles.templateRowContent}>
              <Text style={[styles.templateRowTitle, { color: theme.text }]} numberOfLines={1}>{tpl.title}</Text>
              {tpl.description ? <Text style={[styles.templateRowDesc, { color: theme.secondary }]} numberOfLines={1}>{tpl.description}</Text> : null}
            </View>
            <TouchableOpacity onPress={() => deleteTemplate(tpl.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="trash-outline" size={22} color="#FF6B35" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          style={[styles.addTemplateButton, { backgroundColor: theme.background, borderColor: theme.border }]}
          onPress={() => { setNewTemplateTitle(''); setNewTemplateDesc(''); setTemplateModalVisible(true); }}
        >
          <Ionicons name="add-circle-outline" size={24} color={theme.accent} />
          <Text style={[styles.addTemplateText, { color: theme.accent }]}>Přidat šablonu</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={templateModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Nová šablona úkolu</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="Název šablony"
              placeholderTextColor={theme.secondary}
              value={newTemplateTitle}
              onChangeText={setNewTemplateTitle}
            />
            <TextInput
              style={[styles.modalInput, styles.modalTextArea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="Popis (volitelné)"
              placeholderTextColor={theme.secondary}
              value={newTemplateDesc}
              onChangeText={setNewTemplateDesc}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.border }]} onPress={() => setTemplateModalVisible(false)}>
                <Text style={[styles.modalButtonTextDark, { color: theme.text }]}>Zrušit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.accent }]}
                onPress={() => {
                  if (newTemplateTitle.trim()) {
                    addTemplate({ title: newTemplateTitle.trim(), description: newTemplateDesc.trim() || undefined });
                    setTemplateModalVisible(false);
                  }
                }}
              >
                <Text style={styles.modalButtonText}>Přidat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Správa dat
      </Text>

      <View style={[styles.settingCard, { backgroundColor: theme.card }]}>
        <SettingItem
          label="Exportovat data"
          value="Záloha úkolů a pokroku"
          icon="download"
          onPress={handleExport}
        />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <SettingItem
          label="Importovat data"
          value="Obnovit ze zálohy"
          icon="cloud-upload"
          onPress={handleImport}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        O aplikaci
      </Text>

      <View style={[styles.settingCard, { backgroundColor: theme.card }]}>
        <SettingItem
          label="Verze"
          value="1.0.0"
          icon="information-circle"
        />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <SettingItem
          label="Smazat všechna data"
          value="Smaže vše"
          icon="trash"
          onPress={handleReset}
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.secondary }]}>
          Strom růstu
        </Text>
        <Text style={[styles.footerText, { color: theme.secondary }]}>
          Pěstuj strom, pěstuj se 🌱
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
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 52,
  },
  templateHint: { fontSize: 13, padding: 12 },
  templateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  templateRowContent: { flex: 1 },
  templateRowTitle: { fontSize: 15, fontWeight: '500' },
  templateRowDesc: { fontSize: 12, marginTop: 2 },
  addTemplateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    margin: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  addTemplateText: { fontSize: 16 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 24,
  },
  modalContent: { borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  modalInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    fontSize: 16,
  },
  modalTextArea: { minHeight: 60 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalButton: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalButtonTextDark: { fontSize: 16, fontWeight: '600' },
  footer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    marginTop: 4,
  },
});
