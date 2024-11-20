import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';
import { generateCsv } from '../utils/generate-csv';
import { CsvSearch, outputFormats } from '../../packages/csv-search/csv-search';

const csvFileName = 'test.csv';

describe('CSV Search', () => {
    let cleanupCsv: () => void;
    let csvSnap: Record<string, string>[];
    before(async () => {
        const { cleanup, jsObjectSnapshot } = await generateCsv(csvFileName);
        cleanupCsv = cleanup;
        csvSnap = jsObjectSnapshot;
    });
    after(() => {
        cleanupCsv();
    });

    it('should support TemplateStringsArray call', async () => {
        const searcher = new CsvSearch(outputFormats.table);
        await searcher.loadCsv(csvFileName);

        const value = 33;

        const result = searcher.query`PROJECT col1, col2 FILTER col3 = ${value}`;
        assert.ok(result);
    });
    it('should support string call', async () => {
        const searcher = new CsvSearch(outputFormats.table);
        await searcher.loadCsv(csvFileName);

        const value = 33;

        const result = searcher.query(`PROJECT col1, col2 FILTER col3 = ${value}`);
        assert.ok(result);
    });
    it('should find a record by a column value', async () => {
        const searcher = new CsvSearch(outputFormats.table);
        await searcher.loadCsv(csvFileName);

        const value = 33;
        const dataIndex = csvSnap.findIndex((record) => Number(record.Col3) === value);

        const result = searcher.query`PROJECT col1, col2 FILTER col3 = ${value}`;

        const expected = [{ col1: csvSnap[dataIndex].Col1, col2: csvSnap[dataIndex].Col2 }];
        assert.deepEqual(result, expected);
    });
    it('should find records by gt operator', async () => {
        const searcher = new CsvSearch(outputFormats.table);
        await searcher.loadCsv(csvFileName);

        const value = 33;

        const result = searcher.query`PROJECT col1, col2 FILTER col3 > ${value}`;

        // see generateCsv method for the data
        const expected = [
            { col1: '99000', col2: 'pqr678' },
            { col1: '11122', col2: '123' },
            { col1: '33344', col2: 'vwx234' },
            { col1: '77788', col2: 'BCD890' }];
        assert.deepEqual(result, expected);
    });
    it('should find records by gte operator', async () => {
        const searcher = new CsvSearch(outputFormats.table);
        await searcher.loadCsv(csvFileName);

        const value = 33;

        const result = searcher.query`PROJECT col1, col2 FILTER col3 >= ${value}`;

        // see generateCsv method for the data
        const expected = [
            { col1: '77889', col2: 'mno345' },
            { col1: '99000', col2: 'pqr678' },
            { col1: '11122', col2: '123' },
            { col1: '33344', col2: 'vwx234' },
            { col1: '77788', col2: 'BCD890' },
        ];
        assert.deepEqual(result, expected);
    });
    it('should find records by lt operator', async () => {
        const searcher = new CsvSearch(outputFormats.table);
        await searcher.loadCsv(csvFileName);

        const value = 33;

        const result = searcher.query`PROJECT col1, col2 FILTER col3 < ${value}`;

        // see generateCsv method for the data
        const expected = [
            { col1: '12345', col2: 'abc123' },
            { col1: '55566', col2: 'yzA567' },
            { col1: '67890', col2: 'def456' },
            { col1: '11223', col2: 'ghi789' },
            { col1: '44556', col2: 'jkl012' },
        ];
        assert.deepEqual(result, expected);
    });
    it('should find records by lte operator', async () => {
        const searcher = new CsvSearch(outputFormats.table);
        await searcher.loadCsv(csvFileName);

        const value = 33;

        const result = searcher.query`PROJECT col1, col2 FILTER col3 <= ${value}`;

        // see generateCsv method for the data
        const expected = [
            { col1: '12345', col2: 'abc123' },
            { col1: '55566', col2: 'yzA567' },
            { col1: '67890', col2: 'def456' },
            { col1: '11223', col2: 'ghi789' },
            { col1: '44556', col2: 'jkl012' },
            { col1: '77889', col2: 'mno345' },
        ];
        assert.deepEqual(result, expected);
    });
});