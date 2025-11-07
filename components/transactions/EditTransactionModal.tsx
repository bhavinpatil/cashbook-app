// components/transactions/EditTransactionModal.tsx

import CustomButton from '@/components/CustomButton';
import { useTheme } from '@/contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Transaction } from '@/types/types';
interface Props {
    visible: boolean;
    onClose: () => void;
    transaction: Transaction;
    onUpdate: (updated: Transaction) => void;
    categories: string[];
}

export default function EditTransactionModal({
    visible,
    onClose,
    transaction,
    onUpdate,
    categories: initialCategories,
}: Props) {
    const { theme } = useTheme();

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [categories, setCategories] = useState<string[]>(initialCategories || []);
    const [addCatVisible, setAddCatVisible] = useState(false);
    const [newCategoryText, setNewCategoryText] = useState('');

    /** 🧠 Load initial transaction data & categories whenever modal opens */
    useEffect(() => {
        if (visible && transaction) {
            setAmount(String(transaction.amount));
            setDescription(transaction.description || '');
            setCategory(transaction.category || '');
            setImages(transaction.images || []);
            setDate(new Date(transaction.date));
            loadCategories();
        }
    }, [visible, transaction]);

    const loadCategories = async () => {
        try {
            const stored = await AsyncStorage.getItem('categories');
            setCategories(stored ? JSON.parse(stored) : initialCategories || []);
        } catch (e) {
            console.error('Failed to load categories:', e);
        }
    };

    const saveCategories = async (updated: string[]) => {
        try {
            await AsyncStorage.setItem('categories', JSON.stringify(updated));
            setCategories(updated);
        } catch (e) {
            console.error('Failed to save categories:', e);
        }
    };

    const handlePickImage = async () => {
        if (images.length >= 4) {
            Alert.alert('Limit Reached', 'You can add up to 4 images only.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });
        if (!result.canceled && result.assets?.[0]?.uri) {
            setImages([...images, result.assets[0].uri]);
        }
    };

    const handleRemoveImage = (uri: string) => {
        setImages(images.filter((img) => img !== uri));
    };

    const handleSave = () => {
        if (!amount || isNaN(Number(amount))) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount.');
            return;
        }

        const updatedTx: Transaction = {
            ...transaction,
            amount: Number(amount),
            description,
            category,
            images,
            date: date.toISOString(),
        };

        onUpdate(updatedTx);
    };

    const handleAddCategory = async () => {
        const trimmed = newCategoryText.trim();
        if (!trimmed) {
            Alert.alert('Enter category name');
            return;
        }
        if (categories.includes(trimmed)) {
            Alert.alert('Duplicate category', 'This category already exists.');
            return;
        }
        const updated = [...categories, trimmed];
        await saveCategories(updated);
        setNewCategoryText('');
        setCategory(trimmed);
        setAddCatVisible(false);
    };

    const handleDeleteCategory = async (cat: string) => {
        Alert.alert('Remove Category', `Delete "${cat}" from list?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    const updated = categories.filter((c) => c !== cat);
                    await saveCategories(updated);
                    if (category === cat) setCategory('');
                },
            },
        ]);
    };

    const openDateTimePicker = () => {
        if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
                value: date,
                mode: 'date',
                is24Hour: false,
                onChange: (_: any, selectedDate?: Date) => {
                    if (selectedDate) {
                        DateTimePickerAndroid.open({
                            value: selectedDate,
                            mode: 'time',
                            is24Hour: false,
                            onChange: (_: any, selectedTime?: Date) => {
                                if (selectedTime) {
                                    const finalDate = new Date(
                                        selectedDate.getFullYear(),
                                        selectedDate.getMonth(),
                                        selectedDate.getDate(),
                                        selectedTime.getHours(),
                                        selectedTime.getMinutes()
                                    );
                                    setDate(finalDate);
                                }
                            },
                        });
                    }
                },
            });
        } else {
            setShowDatePicker(true);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View
                    style={[
                        styles.container,
                        { backgroundColor: theme.card, borderColor: theme.border },
                    ]}
                >
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={[styles.title, { color: theme.textDark }]}>
                            Edit Transaction
                        </Text>

                        {/* Amount */}
                        <Label text="Amount" theme={theme} />
                        <Input
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            placeholder="Enter amount"
                            theme={theme}
                        />

                        {/* Description */}
                        <Label text="Description" theme={theme} />
                        <Input
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Description (optional)"
                            multiline
                            theme={theme}
                        />

                        {/* Category */}
                        <Label text="Category" theme={theme} />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {categories.map((c) => (
                                <View key={c} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 6 }}>
                                    <TouchableOpacity
                                        onPress={() => setCategory(c)}
                                        style={{
                                            backgroundColor: category === c ? theme.primary : theme.border,
                                            paddingVertical: 6,
                                            paddingHorizontal: 12,
                                            borderRadius: 16,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: category === c ? '#fff' : theme.textDark,
                                                marginRight: 6,
                                            }}
                                        >
                                            {c}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDeleteCategory(c)}>
                                        <Text style={{ color: theme.danger, fontWeight: 'bold' }}>×</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <TouchableOpacity
                                onPress={() => setAddCatVisible(true)}
                                style={{
                                    backgroundColor: theme.border,
                                    paddingVertical: 6,
                                    paddingHorizontal: 12,
                                    borderRadius: 16,
                                    justifyContent: 'center',
                                }}
                            >
                                <Text style={{ color: theme.textDark }}>＋ Add</Text>
                            </TouchableOpacity>
                        </ScrollView>

                        {/* Date & Time */}
                        <Label text="Date & Time" theme={theme} />
                        <TouchableOpacity
                            onPress={openDateTimePicker}
                            style={[styles.dateButton, { borderColor: theme.border }]}
                        >
                            <Text style={{ color: theme.textLight }}>
                                {dayjs(date).format('DD MMM YYYY, hh:mm A')}
                            </Text>
                        </TouchableOpacity>

                        {/* Images */}
                        <Label text="Images (max 4)" theme={theme} />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {images.map((uri, idx) => (
                                <View key={idx} style={{ position: 'relative', marginRight: 8 }}>
                                    <Image
                                        source={{ uri }}
                                        style={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: 8,
                                            borderWidth: 1,
                                            borderColor: theme.border,
                                        }}
                                    />
                                    <TouchableOpacity
                                        onPress={() => handleRemoveImage(uri)}
                                        style={styles.removeImg}
                                    >
                                        <Text style={{ color: '#fff', fontSize: 12 }}>×</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                            {images.length < 4 && (
                                <TouchableOpacity
                                    onPress={handlePickImage}
                                    style={[
                                        styles.addImg,
                                        { borderColor: theme.border, backgroundColor: theme.border },
                                    ]}
                                >
                                    <Text style={{ fontSize: 26, color: theme.textLight }}>＋</Text>
                                </TouchableOpacity>
                            )}
                        </ScrollView>

                        {/* Buttons */}
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                            <CustomButton
                                title="Cancel"
                                onPress={onClose}
                                style={{
                                    flex: 1,
                                    backgroundColor: theme.card,
                                    borderWidth: 1,
                                    borderColor: theme.border,
                                }}
                                textColor={theme.textDark}
                            />
                            <CustomButton
                                title="💾 Save"
                                onPress={handleSave}
                                style={{ flex: 1, backgroundColor: theme.primary }}
                            />
                        </View>
                    </ScrollView>
                </View>
            </View>

            {/* Add Category Modal */}
            <Modal visible={addCatVisible} transparent animationType="slide">
                <View style={styles.overlay}>
                    <View
                        style={[
                            styles.addCatModal,
                            { backgroundColor: theme.card, borderColor: theme.border },
                        ]}
                    >
                        <Text style={[styles.subTitle, { color: theme.textDark }]}>
                            Add New Category
                        </Text>
                        <TextInput
                            placeholder="Category name"
                            placeholderTextColor={theme.textLight}
                            value={newCategoryText}
                            onChangeText={setNewCategoryText}
                            style={[
                                styles.catInput,
                                { borderColor: theme.border, color: theme.textDark },
                            ]}
                        />
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <CustomButton
                                title="Cancel"
                                onPress={() => setAddCatVisible(false)}
                                type="secondary"
                                style={{ flex: 1 }}
                            />
                            <CustomButton
                                title="Add"
                                onPress={handleAddCategory}
                                style={{ flex: 1, backgroundColor: theme.primary }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </Modal>
    );
}

/* ----- Small subcomponents ----- */
const Label = ({ text, theme }: any) => (
    <Text style={{ color: theme.textLight, marginTop: 8, marginBottom: 4, fontWeight: '500' }}>
        {text}
    </Text>
);

const Input = ({ value, onChangeText, placeholder, multiline, keyboardType, theme }: any) => (
    <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textLight}
        keyboardType={keyboardType}
        multiline={multiline}
        style={{
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 10,
            padding: 10,
            color: theme.textDark,
            height: multiline ? 80 : undefined,
            marginBottom: 10,
            textAlignVertical: multiline ? 'top' : 'center',
        }}
    />
);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '92%',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        maxHeight: '90%',
    },
    title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
    subTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
    addCatModal: {
        width: '90%',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
    },
    catInput: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        marginBottom: 12,
    },
    dateButton: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
    },
    removeImg: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#ef4444',
        borderRadius: 10,
        paddingHorizontal: 4,
    },
    addImg: {
        width: 80,
        height: 80,
        borderWidth: 1,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
