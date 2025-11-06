import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';
import { Transaction } from '../types';

console.log("useexport================= ", FileSystem.documentDirectory);

export const useExport = () => {

    const exportToExcel = async (transactions: Transaction[], bookName: string) => {
        try {
            const wb = XLSX.utils.book_new();
            const wsData = transactions.map(tx => ({
                Date: tx.date,
                Type: tx.type,
                Category: tx.category,
                Amount: tx.amount,
                Description: tx.description,
            }));
            const ws = XLSX.utils.json_to_sheet(wsData);
            XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

            const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
            const uri = `${FileSystem.documentDirectory}${bookName}_transactions.xlsx`;

            await FileSystem.writeAsStringAsync(uri, wbout, { encoding: 'base64' });
            console.log('Excel saved at:', uri);
            return uri;
        } catch (error) {
            console.error('Excel export error:', error);
            throw error;
        }
    };

    const exportToCSV = async (transactions: Transaction[], bookName: string) => {
        try {
            const header = 'Date,Type,Category,Amount,Description';
            const rows = transactions.map(tx =>
                `${tx.date},${tx.type},${tx.category},${tx.amount},${tx.description}`
            );
            const csvString = [header, ...rows].join('\n');

            const uri = `${FileSystem.documentDirectory}${bookName}_transactions.csv`;
            await FileSystem.writeAsStringAsync(uri, csvString, { encoding: 'utf8' });
            console.log('CSV saved at:', uri);
            return uri;
        } catch (error) {
            console.error('CSV export error:', error);
            throw error;
        }
    };

    //   const shareFile = async (fileUri: string) => {
    //     if (!(await Sharing.isAvailableAsync())) {
    //       alert('Sharing is not available on this device');
    //       return;
    //     }
    //     await Sharing.shareAsync(fileUri);
    //   };
    const shareFile = async (fileUri: string) => {
        console.log("Entered the sharing function");
        const available = await Sharing.isAvailableAsync();
        if (!available) {
            alert(`Sharing not supported in Expo Go. File saved at: ${fileUri}`);
            console.log('File URI:', fileUri);  
            return;
        }
        await Sharing.shareAsync(fileUri);
    };


    return { exportToExcel, exportToCSV, shareFile };
};
