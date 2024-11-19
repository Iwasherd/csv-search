import { createObjectCsvWriter } from 'csv-writer';
import fs from 'node:fs';

type Record = {
    Col1: string;
    Col2: string;
    Col3: string;
    Col4: string;
    Col5: string;
    Col6: string;
    Col7: string;
    Col8: string;
    Col9: string;
    Col10: string;
};

/**
 * Generate a CSV file with 1000 rows and 10 columns
 * first column contains a string of 5-15 numbers in Unicode format
 * second column contains a string of 5-15 letters and numbers in Unicode format
 * other columns contain numbers
 * @param path
 */
export async function generateCsv(path = 'generated_data.csv') {
    const csvWriter = createObjectCsvWriter({
        path: path,
        header: [
            { id: 'Col1', title: 'Col1' },
            { id: 'Col2', title: 'Col2' },
            { id: 'Col3', title: 'Col3' },
            { id: 'Col4', title: 'Col4' },
            { id: 'Col5', title: 'Col5' },
            { id: 'Col6', title: 'Col6' },
            { id: 'Col7', title: 'Col7' },
            { id: 'Col8', title: 'Col8' },
            { id: 'Col9', title: 'Col9' },
            { id: 'Col10', title: 'Col10' },
        ],
    });


    const records: Record[] = [];
    for (let i = 0; i < 10; i++) {
        const record: Record = {} as Record;
        record['Col1'] = unicodeNumberString(Math.floor(Math.random() * 10) + 5);
        record['Col2'] = mixedUnicodeString(Math.floor(Math.random() * 10) + 5);

        for (let j = 3; j <= 10; j++) {
            const key = `Col${j}` as keyof Record;
            record[key] = unicodeNumberString(Math.floor(Math.random() * 20) + 1);
        }
        records.push(record);
    }


    try {
        await csvWriter.writeRecords(records);
        console.info(`CSV file generated at ${path}`);
    } catch (error) {
        console.error('Failed to write CSV file', error);
    }

    return () => removeCsv(path);
}

function removeCsv(path = 'generated_data.csv') {
    try {
        fs.unlinkSync(path);
        console.info(`CSV file removed at ${path}`);
    } catch (error) {
        console.error('Failed to remove CSV file', error);
    }
}

/**
 * Generate a string with only numbers in Unicode format
 * @param length
 */
function unicodeNumberString(length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += String.fromCharCode(48 + Math.floor(Math.random() * 10));
    }
    return result;
}

/**
 * Generate a string with a mix of letters and numbers in Unicode format
 * @param length
 */
function mixedUnicodeString(length: number): string {
    let result = '';
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < length; i++) {
        result += Math.random() > 0.5
            ? String.fromCharCode(48 + Math.floor(Math.random() * 10))
            : chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}