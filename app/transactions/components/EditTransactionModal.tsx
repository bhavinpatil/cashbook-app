// app/transactions/components/EditTransactionModal.tsx
import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '@/constants/theme';
import CustomButton from '@/components/CustomButton';
import { Transaction } from '../types';

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
    categories,
}: Props) {
    const [amount, setAmount] = useState(String(transaction.amount));
    const [description, setDescription] = useState(transaction.description || '');
    const [category, setCategory] = useState(transaction.category || '');
    const [images, setImages] = useState<string[]>(transaction.images || []);
    const [date, setDate] = useState(new Date(transaction.date));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        if (transaction) {
            setAmount(String(transaction.amount));
            setDescription(transaction.description || '');
            setCategory(transaction.category || '');
            setImages(transaction.images || []);
            setDate(new Date(transaction.date));
        }
    }, [transaction]);


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

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    padding: 16,
                }}
            >
                <View
                    style={{
                        backgroundColor: COLORS.card,
                        borderRadius: 10,
                        padding: 16,
                        maxHeight: '90%',
                    }}
                >
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: 'bold',
                                textAlign: 'center',
                                marginBottom: 10,
                                color: COLORS.textDark,
                            }}
                        >
                            Edit Transaction
                        </Text>

                        {/* Amount */}
                        <Text style={{ color: COLORS.textLight }}>Amount</Text>
                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: COLORS.border,
                                borderRadius: 8,
                                padding: 8,
                                marginBottom: 10,
                                color: COLORS.textDark,
                            }}
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                        />

                        {/* Description */}
                        <Text style={{ color: COLORS.textLight }}>Description</Text>
                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: COLORS.border,
                                borderRadius: 8,
                                padding: 8,
                                marginBottom: 10,
                                color: COLORS.textDark,
                            }}
                            placeholder="Description"
                            value={description}
                            onChangeText={setDescription}
                        />

                        {/* Category */}
                        <Text style={{ color: COLORS.textLight }}>Category</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{ flexDirection: 'row', marginBottom: 10 }}
                        >
                            {categories.map((c) => (
                                <TouchableOpacity
                                    key={c}
                                    onPress={() => setCategory(c)}
                                    style={{
                                        backgroundColor:
                                            category === c ? COLORS.primary : COLORS.border,
                                        paddingVertical: 6,
                                        paddingHorizontal: 12,
                                        borderRadius: 16,
                                        marginRight: 8,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: category === c ? 'white' : COLORS.textDark,
                                            fontSize: 14,
                                        }}
                                    >
                                        {c}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                onPress={() => {
                                    const newCat = prompt('Enter new category:');
                                    if (newCat) setCategory(newCat);
                                }}
                                style={{
                                    backgroundColor: COLORS.border,
                                    paddingVertical: 6,
                                    paddingHorizontal: 12,
                                    borderRadius: 16,
                                }}
                            >
                                <Text style={{ color: COLORS.textDark }}>＋ Add</Text>
                            </TouchableOpacity>
                        </ScrollView>

                        {/* Date */}
                        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                            <Text style={{ color: COLORS.textLight, marginBottom: 5 }}>
                                Date: {date.toDateString()}
                            </Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                onChange={(e, selectedDate) => {
                                    setShowDatePicker(false);
                                    if (selectedDate) setDate(selectedDate);
                                }}
                            />
                        )}

                        {/* Images */}
                        <Text style={{ color: COLORS.textLight, marginTop: 10 }}>Images</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {images.map((uri, idx) => (
                                <View key={idx} style={{ position: 'relative', marginRight: 8 }}>
                                    <TouchableOpacity onPress={() => setPreviewImage(uri)}>
                                        <Image
                                            source={{ uri }}
                                            style={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: 8,
                                                marginTop: 5,
                                            }}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleRemoveImage(uri)}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                            borderRadius: 10,
                                            padding: 2,
                                        }}
                                    >
                                        <Text style={{ color: 'white', fontSize: 12 }}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                            {images.length < 4 && (
                                <TouchableOpacity
                                    onPress={handlePickImage}
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderWidth: 1,
                                        borderColor: COLORS.border,
                                        borderRadius: 8,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginTop: 5,
                                    }}
                                >
                                    <Text style={{ fontSize: 28, color: COLORS.textLight }}>＋</Text>
                                </TouchableOpacity>
                            )}
                        </ScrollView>

                        <CustomButton title="💾 Save Changes" onPress={handleSave} style={{ marginTop: 20 }} />
                        <TouchableOpacity
                            onPress={onClose}
                            style={{ marginTop: 10, alignItems: 'center' }}
                        >
                            <Text style={{ color: COLORS.danger, margin: 20, fontWeight: "bold" }} >Cancel</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
            <Modal
                visible={!!previewImage}
                transparent
                animationType="fade"
                onRequestClose={() => setPreviewImage(null)}
            >
                <View style={styles.previewContainer}>
                    <TouchableOpacity
                        style={styles.previewBackdrop}
                        onPress={() => setPreviewImage(null)}
                    />
                    {previewImage && (
                        <Image
                            source={{ uri: previewImage }}
                            style={styles.previewImage}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </Modal>

        </Modal>
    );
}

const styles = StyleSheet.create({
    previewContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewBackdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    previewImage: {
        width: '90%',
        height: '80%',
        borderRadius: 10,
    },
});
