// utils/dataBackup.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

const BACKUP_FILENAME = 'cashbook_backup.json';

/**
 * Export all app data into a single JSON file and allow saving to user-selected location
 */
export const exportAllData = async (): Promise<string | null> => {
  try {
    // 1️⃣ Collect all AsyncStorage data
    const keys = await AsyncStorage.getAllKeys();
    const allData: Record<string, any> = {};

    for (const key of keys) {
      const val = await AsyncStorage.getItem(key);
      if (val) {
        try {
          allData[key] = JSON.parse(val);
        } catch {
          allData[key] = val;
        }
      }
    }

    // 2️⃣ Create backup object
    const exportObj = {
      meta: { version: '0.2-dev', exportedAt: new Date().toISOString() },
      data: allData,
    };
    const jsonString = JSON.stringify(exportObj, null, 2);

    // 3️⃣ Write file to app's document directory
    const fileUri = FileSystem.documentDirectory + BACKUP_FILENAME;
    await FileSystem.writeAsStringAsync(fileUri, jsonString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // 4️⃣ Let user save the file elsewhere
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Save Cashbook Backup File',
          UTI: 'public.json', // for iOS
        });
      } else {
        Alert.alert('File Saved', `Backup stored at:\n${fileUri}`);
      }
    } else {
      Alert.alert('Export Successful', `Backup file saved at:\n${fileUri}`);
    }

    return fileUri;
  } catch (error) {
    console.error('Export failed:', error);
    Alert.alert('❌ Export Failed', 'Unable to export your data.');
    return null;
  }
};

/**
 * Import previously exported backup file
 */
export const importAllData = async (): Promise<void> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }

    const fileUri = result.assets[0].uri;
    const jsonString = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    const parsed = JSON.parse(jsonString);

    if (!parsed.data || typeof parsed.data !== 'object') {
      Alert.alert('Invalid File', 'Selected file does not contain valid backup data.');
      return;
    }

    Alert.alert(
      'Import Data',
      'This will replace all your existing app data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          style: 'destructive',
          onPress: async () => {
            for (const [key, value] of Object.entries(parsed.data)) {
              await AsyncStorage.setItem(key, JSON.stringify(value));
            }
            Alert.alert('✅ Import Successful', 'App data restored successfully!');
          },
        },
      ]
    );
  } catch (error) {
    console.error('Import failed:', error);
    Alert.alert('❌ Import Failed', 'Unable to import data from file.');
  }
};
