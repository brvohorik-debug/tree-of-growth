import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '../../store/useStore';
import { UserImage } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';

export default function GalleryScreen() {
  const { userImages, addImage, deleteImage, settings } = useStore();
  const [selectedImage, setSelectedImage] = useState<UserImage | null>(null);
  const [imageType, setImageType] = useState<UserImage['type']>('theme');

  const isDark = settings.isDarkMode;
  const theme = {
    background: isDark ? '#1a1a1a' : '#f5f5f5',
    text: isDark ? '#ffffff' : '#000000',
    card: isDark ? '#2a2a2a' : '#ffffff',
    accent: '#4a7c2a',
    secondary: isDark ? '#666' : '#999',
    border: isDark ? '#333' : '#ddd',
  };

  const pickImage = async (type: UserImage['type']) => {
    setImageType(type);
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Potřeba oprávnění',
        'Povolte přístup k fotografiím v nastavení.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const newImage: UserImage = {
        id: Date.now().toString(),
        uri: asset.uri,
        type: type,
        name: `Obrázek ${new Date().toLocaleDateString('cs-CZ')}`,
        createdAt: new Date().toISOString(),
      };

      try {
        await addImage(newImage);
        Alert.alert('Úspěch', 'Obrázek byl přidán do galerie.');
      } catch (error) {
        Alert.alert('Chyba', 'Nepodařilo se uložit obrázek.');
        console.error(error);
      }
    }
  };

  const handleDelete = (image: UserImage) => {
    Alert.alert(
      'Smazat obrázek',
      'Opravdu chcete tento obrázek smazat?',
      [
        { text: 'Zrušit', style: 'cancel' },
        {
          text: 'Smazat',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteImage(image.id);
              if (selectedImage?.id === image.id) {
                setSelectedImage(null);
              }
            } catch (error) {
              Alert.alert('Chyba', 'Nepodařilo se smazat obrázek.');
            }
          },
        },
      ]
    );
  };

  const imageTypes: { type: UserImage['type']; label: string; icon: string }[] = [
    { type: 'theme', label: 'Motiv', icon: 'color-palette' },
    { type: 'background', label: 'Pozadí', icon: 'image' },
    { type: 'leaf', label: 'List', icon: 'leaf' },
    { type: 'reward', label: 'Odměna', icon: 'trophy' },
  ];

  const filteredImages = userImages.filter((img) => img.type === imageType);

  const renderImage = ({ item }: { item: UserImage }) => (
    <TouchableOpacity
      style={[styles.imageCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => setSelectedImage(item)}
    >
      <Image source={{ uri: item.uri }} style={styles.thumbnail} />
      <View style={styles.imageInfo}>
        <Text style={[styles.imageName, { color: theme.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={18} color="#FF6B35" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Type Selector */}
      <View style={[styles.typeSelector, { backgroundColor: theme.card }]}>
        {imageTypes.map(({ type, label, icon }) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              {
                backgroundColor:
                  imageType === type ? theme.accent : theme.background,
                borderColor: theme.border,
              },
            ]}
            onPress={() => setImageType(type)}
          >
            <Ionicons
              name={icon as any}
              size={20}
              color={imageType === type ? '#fff' : theme.text}
            />
            <Text
              style={[
                styles.typeButtonText,
                {
                  color: imageType === type ? '#fff' : theme.text,
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.accent }]}
        onPress={() => pickImage(imageType)}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Přidat {imageTypes.find(t => t.type === imageType)?.label}</Text>
      </TouchableOpacity>

      {/* Image Grid */}
      {filteredImages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="images-outline" size={64} color={theme.secondary} />
          <Text style={[styles.emptyText, { color: theme.secondary }]}>
            Zatím žádné obrázky typu {imageTypes.find(t => t.type === imageType)?.label.toLowerCase()}.
            {'\n'}Přidej první a přizpůsob svůj strom!
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredImages}
          renderItem={renderImage}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
        />
      )}

      {/* Image Preview Modal */}
      <Modal
        visible={selectedImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            {selectedImage && (
              <>
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: theme.accent }]}
                    onPress={() => {
                      // TODO: Set as active theme/background
                      Alert.alert('Úspěch', 'Obrázek byl nastaven.');
                      setSelectedImage(null);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Použít</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#FF6B35' }]}
                    onPress={() => handleDelete(selectedImage)}
                  >
                    <Text style={styles.modalButtonText}>Smazat</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: theme.secondary }]}
                    onPress={() => setSelectedImage(null)}
                  >
                    <Text style={styles.modalButtonText}>Zavřít</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  typeSelector: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  grid: {
    padding: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  imageCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  thumbnail: {
    width: '100%',
    height: 150,
    backgroundColor: '#e0e0e0',
  },
  imageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  imageName: {
    flex: 1,
    fontSize: 12,
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  previewImage: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalActions: {
    gap: 12,
  },
  modalButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
