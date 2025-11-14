// utils/dataBackup.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

const BACKUP_FILENAME = 'cashbook_backup.json';
const SCHEMA_VERSION = 1;

/** ---------- HELPERS TO LOAD ONLY ACTIVE, REAL DATA ---------- */

const loadGlobalBudget = async () => {
  const raw = await AsyncStorage.getItem("global_budget");
  return raw ? JSON.parse(raw) : 0;
};

const loadAllTransactions = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const txKeys = keys.filter(k => k.startsWith("transactions_"));

  const result: Record<string, any[]> = {};

  for (const key of txKeys) {
    const raw = await AsyncStorage.getItem(key);
    result[key.replace("transactions_", "")] = raw ? JSON.parse(raw) : [];
  }
  return result;
};

const loadAllSmsTransactions = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const smsKeys = keys.filter(k => k.startsWith("sms_transactions_"));

  const result: Record<string, any[]> = {};

  for (const key of smsKeys) {
    const raw = await AsyncStorage.getItem(key);
    result[key.replace("sms_transactions_", "")] = raw ? JSON.parse(raw) : [];
  }
  return result;
};

const loadAllInvestments = async () => {
  const raw = await AsyncStorage.getItem("investments_store");
  return raw ? JSON.parse(raw) : [];
};

const loadTrips = async () => {
  const raw = await AsyncStorage.getItem("trips");
  return raw ? JSON.parse(raw) : [];
};

/** ------------ CLEAN EXPORT  (NO OLD OR DELETED DATA) ------------ */

export const exportAllData = async (): Promise<string | null> => {
  try {
    const exportObj = {
      schema: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        globalBudget: await loadGlobalBudget(),
        transactions: await loadAllTransactions(),
        smsTransactions: await loadAllSmsTransactions(),
        investments: await loadAllInvestments(),
        trips: await loadTrips(),
      }
    };

    const jsonString = JSON.stringify(exportObj, null, 2);
    const fileUri = FileSystem.documentDirectory + BACKUP_FILENAME;

    await FileSystem.writeAsStringAsync(fileUri, jsonString);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/json",
        dialogTitle: "Save Cashbook Backup File",
        UTI: "public.json"
      });
    } else {
      Alert.alert("Backup Saved", fileUri);
    }

    return fileUri;
  } catch (error) {
    console.error("Export failed:", error);
    Alert.alert("❌ Export Failed", "Unable to export your data.");
    return null;
  }
};

/** -------------------- CLEAN IMPORT ------------------------------ */

export const importAllData = async (): Promise<void> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    const fileUri = result.assets[0].uri;
    const raw = await FileSystem.readAsStringAsync(fileUri);
    const parsed = JSON.parse(raw);

    if (!parsed.data) {
      Alert.alert("Invalid File", "This backup does not contain valid data.");
      return;
    }

    Alert.alert(
      "Import Data",
      "This will replace all your existing Cashbook data. Continue?",
      [
        { text: "Cancel", style: "cancel" },

        {
          text: "Import",
          style: "destructive",
          onPress: async () => {
            // Clear relevant existing data
            const keys = await AsyncStorage.getAllKeys();
            const validPrefixes = [
              "global_budget",
              "transactions_",
              "sms_transactions_",
              "investments_store",
              "trips"
            ];

            for (const key of keys) {
              if (validPrefixes.some(p => key.startsWith(p))) {
                await AsyncStorage.removeItem(key);
              }
            }

            // Restore data cleanly
            const { globalBudget, transactions, smsTransactions, investments, trips } = parsed.data;

            await AsyncStorage.setItem("global_budget", JSON.stringify(globalBudget));
            await AsyncStorage.setItem("investments_store", JSON.stringify(investments));
            await AsyncStorage.setItem("trips", JSON.stringify(trips));

            // restore per-book transactions
            for (const bookId in transactions) {
              await AsyncStorage.setItem(
                `transactions_${bookId}`,
                JSON.stringify(transactions[bookId])
              );
            }

            // restore sms by month
            for (const monthKey in smsTransactions) {
              await AsyncStorage.setItem(
                `sms_transactions_${monthKey}`,
                JSON.stringify(smsTransactions[monthKey])
              );
            }

            Alert.alert("✅ Import Successful", "Your data has been restored.");
          },
        }
      ]
    );
  } catch (error) {
    console.error("Import failed:", error);
    Alert.alert("❌ Import Failed", "Unable to import data.");
  }
};
