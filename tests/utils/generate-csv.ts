import { createObjectCsvWriter } from 'csv-writer';
import fs from 'node:fs';

export interface CSVRecord {
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
}

/**
 * Generate a CSV file with 10 rows and 10 columns
 * first column contains a string of 5-15 numbers in Unicode format
 * second column contains a string of 5-15 letters and numbers in Unicode format
 * other columns contain numbers
 * @param path
 *
 * static snapshot:
 * | Col1  | Col2   | Col3 | Col4 | Col5 | Col6 | Col7 | Col8 | Col9 | Col10 |
 * |-------|--------|------|------|------|------|------|------|------|-------|
 * | 12345 | abc123 | 1    | 2    | 3    | 4    | 5    | 6    | 7    | 8     |
 * | 67890 | def456 | 9    | 10   | 11   | 12   | 13   | 14   | 15   | 16    |
 * | 11223 | ghi789 | 17   | 18   | 19   | 20   | 21   | 22   | 23   | 24    |
 * | 44556 | jkl012 | 25   | 26   | 27   | 28   | 29   | 30   | 31   | 32    |
 * | 77889 | mno345 | 33   | 34   | 35   | 36   | 37   | 38   | 39   | 40    |
 * | 99000 | pqr678 | 41   | 42   | 43   | 44   | 45   | 46   | 47   | 48    |
 * | 11122 | 123    | 49   | 50   | 51   | 52   | 53   | 54   | 55   | 56    |
 * | 33344 | vwx234 | 57   | 58   | 59   | 60   | 61   | 62   | 63   | 64    |
 * | 55566 | yzA567 | 3   | 66   | 67   | 68   | 69   | 70   | 71   | 72    |
 * | 77788 | BCD890 | 73   | 74   | 75   | 76   | 77   | 78   | 79   | 80    |
 */
export async function generateCsv(path = 'generated_data.csv') {
    const header = Array.from({ length: 10 }, (_, i) => ({
        id: `Col${i + 1}`,
        title: `Col${i + 1}`,
    }));

    const csvWriter = createObjectCsvWriter({
        path: path,
        header: header,
    });

    const records: CSVRecord[] = [
        {
            Col1: '12345',
            Col2: 'abc123',
            Col3: '1',
            Col4: '2',
            Col5: '3',
            Col6: '4',
            Col7: '5',
            Col8: '6',
            Col9: '7',
            Col10: '8',
        },
        {
            Col1: '67890',
            Col2: 'def456',
            Col3: '9',
            Col4: '10',
            Col5: '11',
            Col6: '12',
            Col7: '13',
            Col8: '14',
            Col9: '15',
            Col10: '16',
        },
        {
            Col1: '11223',
            Col2: 'ghi789',
            Col3: '17',
            Col4: '18',
            Col5: '19',
            Col6: '20',
            Col7: '21',
            Col8: '22',
            Col9: '23',
            Col10: '24',
        },
        {
            Col1: '44556',
            Col2: 'jkl012',
            Col3: '25',
            Col4: '26',
            Col5: '27',
            Col6: '28',
            Col7: '29',
            Col8: '30',
            Col9: '31',
            Col10: '32',
        },
        {
            Col1: '77889',
            Col2: 'mno345',
            Col3: '33',
            Col4: '34',
            Col5: '35',
            Col6: '36',
            Col7: '37',
            Col8: '38',
            Col9: '39',
            Col10: '40',
        },
        {
            Col1: '99000',
            Col2: 'pqr678',
            Col3: '41',
            Col4: '42',
            Col5: '43',
            Col6: '44',
            Col7: '45',
            Col8: '46',
            Col9: '47',
            Col10: '48',
        },
        {
            Col1: '11122',
            Col2: '123',
            Col3: '49',
            Col4: '50',
            Col5: '51',
            Col6: '52',
            Col7: '53',
            Col8: '54',
            Col9: '55',
            Col10: '56',
        },
        {
            Col1: '33344',
            Col2: 'vwx234',
            Col3: '57',
            Col4: '58',
            Col5: '59',
            Col6: '60',
            Col7: '61',
            Col8: '62',
            Col9: '63',
            Col10: '64',
        },
        {
            Col1: '55566',
            Col2: 'yzA567',
            Col3: '3',
            Col4: '66',
            Col5: '67',
            Col6: '68',
            Col7: '69',
            Col8: '70',
            Col9: '71',
            Col10: '72',
        },
        {
            Col1: '77788',
            Col2: 'BCD890',
            Col3: '73',
            Col4: '74',
            Col5: '75',
            Col6: '76',
            Col7: '77',
            Col8: '78',
            Col9: '79',
            Col10: '80',
        },
    ];

    try {
        await csvWriter.writeRecords(records);
        console.info(`CSV file generated at ${path}`);
    } catch (error) {
        console.error('Failed to write CSV file', error);
    }

    return {
        cleanup: () => removeCsv(path),
        jsObjectSnapshot: records,
    };
}

function removeCsv(path = 'generated_data.csv') {
    try {
        fs.unlinkSync(path);
        console.info(`CSV file removed at ${path}`);
    } catch (error) {
        console.error('Failed to remove CSV file', error);
    }
}