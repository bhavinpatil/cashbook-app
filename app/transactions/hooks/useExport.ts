// app/transactions/hooks/useExport.ts

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';
import { Transaction } from '../types';

export const useExport = () => {

    const formatDateTimeToIST = (dateStr: string) => {
        const dateObj = new Date(dateStr);

        const date = new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            timeZone: 'Asia/Kolkata',
        }).format(dateObj);

        const time = new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata',
        }).format(dateObj);

        return { date, time };
    };


    const exportToExcel = async (transactions: Transaction[], bookName: string, businessName?: string) => {
        try {
            const wb = XLSX.utils.book_new();
            const now = new Date();

            const wsData = transactions.map(tx => {
                const { date, time } = formatDateTimeToIST(tx.date);
                return {
                    Date: date,
                    Time: time,
                    Type: tx.type,
                    Category: tx.category,
                    Amount: tx.amount,
                    Description: tx.description,
                };
            });

            const ws = XLSX.utils.json_to_sheet(wsData);
            XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

            const timestamp = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}_${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}`;

            const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
            // const filename = `${bookName}${businessName ? `_${businessName}` : ''}_transactions.xlsx`;
            const filename = `${bookName}${businessName ? `_${businessName}` : ''}_transactions_${timestamp}.xlsx`;
            const uri = `${FileSystem.documentDirectory}${filename}`;

            await FileSystem.writeAsStringAsync(uri, wbout, { encoding: 'base64' });
            return uri;
        } catch (error) {
            console.error('Excel export error:', error);
            throw error;
        }
    };


    const exportToCSV = async (transactions: Transaction[], bookName: string, businessName?: string) => {
        try {
            const header = 'Date,Time,Type,Category,Amount,Description';
            const rows = transactions.map(tx => {
                const { date, time } = formatDateTimeToIST(tx.date);
                return `${date},${time},${tx.type},${tx.category},${tx.amount},${tx.description}`;
            });
            const csvString = [header, ...rows].join('\n');

            const filename = `${bookName}${businessName ? `_${businessName}` : ''}_transactions.csv`;
            const uri = `${FileSystem.documentDirectory}${filename}`;
            await FileSystem.writeAsStringAsync(uri, csvString, { encoding: 'utf8' });
            return uri;
        } catch (error) {
            console.error('CSV export error:', error);
            throw error;
        }
    };

    const shareFile = async (fileUri: string) => {
        const available = await Sharing.isAvailableAsync();
        if (!available) {
            alert(`Sharing not supported in Expo Go. File saved at: ${fileUri}`);
            return;
        }
        await Sharing.shareAsync(fileUri);
    };


    return { exportToExcel, exportToCSV, shareFile };
};
