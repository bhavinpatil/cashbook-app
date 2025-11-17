// hooks/useSmsCategories.ts
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'sms_custom_categories';

export const DEFAULT_SMS_CATEGORIES = [
    'Groceries',
    'Bills',
    'Fuel',
    'Travel',
    'Food',
    'Shopping',
    'Entertainment',
    'Other',
];

export function useSmsCategories() {
    const [customCategories, setCustomCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            const parsed = saved ? JSON.parse(saved) : [];
            setCustomCategories(parsed);
        } finally {
            setLoading(false);
        }
    };

    const addCategory = async (name: string) => {
        const trimmed = name.trim();
        if (!trimmed) return;

        const updated = Array.from(new Set([...customCategories, trimmed]));

        setCustomCategories(updated);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    const merged = [...DEFAULT_SMS_CATEGORIES, ...customCategories];

    // remove duplicates and normalize case
    const allCategories = Array.from(new Set(
        merged.map(c => c.trim())
    ));

    return { allCategories, customCategories, addCategory, loading };
}
