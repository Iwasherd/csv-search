import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { generateCsv } from '../utils/generate-csv';

describe('CSV Search', () => {
    it('should find a record by a column value', async () => {
        const cleanup = await generateCsv();
        cleanup();
        assert.equal(0, 1);
    })
});