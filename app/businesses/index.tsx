// // app/businesses/add-business.tsx
// import React, { useState } from 'react';
// import { View, Text, Alert, StyleSheet } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRouter } from 'expo-router';
// import ScreenContainer from '@/components/ScreenContainer';
// import CustomButton from '@/components/CustomButton';
// import InputField from '@/components/InputField';
// import { COLORS, GLOBAL_STYLES } from '@/constants/theme';

// export default function AddBusinessScreen() {
//   const [businessName, setBusinessName] = useState('');
//   const router = useRouter();

//   const handleAddBusiness = async () => {
//     if (!businessName.trim()) {
//       Alert.alert('Validation Error', 'Please enter a business name.');
//       return;
//     }

//     try {
//       const existingData = await AsyncStorage.getItem('businesses');
//       const businesses = existingData ? JSON.parse(existingData) : [];

//       const newBusiness = { id: Date.now().toString(), name: businessName.trim() };
//       const updatedList = [...businesses, newBusiness];
//       await AsyncStorage.setItem('businesses', JSON.stringify(updatedList));
      
//     } catch (error) {
//       Alert.alert('Error', 'Failed to save the business.');
//       console.error(error);
//     }
//   };


//   return (
//     <ScreenContainer>
//       <Text style={GLOBAL_STYLES.title}>Add New Business</Text>
//       <Text style={GLOBAL_STYLES.subtitle}>
//         Create a new business profile to manage its books.
//       </Text>

//       <View style={styles.form}>
//         <InputField
//           placeholder="Enter Business Name"
//           value={businessName}
//           onChangeText={setBusinessName}
//         />

//         <CustomButton title="Save Business" onPress={handleAddBusiness} />
//       </View>
//     </ScreenContainer>
//   );
// }

// const styles = StyleSheet.create({
//   form: {
//     marginTop: 20,
//   },
// });


export default function HiddenBusinessScreen() {
  return null; // screen disabled
}
