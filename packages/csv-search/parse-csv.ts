import fs from 'node:fs';
import { join } from 'node:path';
import { parse } from 'csv-parse';

const __dirname = process.cwd();

export const processFile = (path: string) => {
    if (!path) {
        throw new Error('No csv file path');
    }

    const filePath = join(__dirname, path);

    return fs.createReadStream(filePath).pipe(parse({ columns: true }));
};