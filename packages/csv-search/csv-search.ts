import { processFile } from './parse-csv';
import { indexGenerator, Index } from './generate-index';
import { tableOutput } from './table-output';
import { jsonOutput } from './json-output';
import { QueryParser, keywords, Filter, Project } from './query-parser';
import { binarySearch } from './binary-search';

export const outputFormats = {
    json: 'json',
    table: 'table',
} as const;

type Data = Record<string, string>[];

const supportedOperators = ['=', '>', '<', '>=', '<='];

export class CsvSearch {
    outputFormat: keyof typeof outputFormats = outputFormats.json;
    index: Index = {
        buckets: {},
        columnTypes: {},
        orderedKeys: {},
    };
    data: Data = [];

    constructor(outputFormat?: keyof typeof outputFormats) {
        this.outputFormat = outputFormat || outputFormats.json;
    }

    setOutputFormat(format: keyof typeof outputFormats): void {
        this.outputFormat = format;
    }

    async loadCsv(path: string): Promise<void> {
        try {
            const parser = processFile(path);
            this.index = {
                buckets: {},
                columnTypes: {},
                orderedKeys: {},
            };

            const generator = indexGenerator();
            generator.next();

            for await (let record of parser) {
                // Convert all keys to lowercase
                record = Object.entries(record).reduce((acc, [key, value]) => {
                    return { ...acc, [key.toLowerCase()]: value };
                }, {});
                this.data.push(record);
                generator.next(record);
            }

            this.index = generator.next().value;
            generator.return(undefined);

        } catch (error) {
            console.error('Failed to load CSV file', error);
        }
    }

    query(query: TemplateStringsArray | string, ...keys: string[] | number[]): Data | [] {
        try {
            const queryParser = new QueryParser();
            const parsedQuery = queryParser.parse(query, ...keys);

            if (!parsedQuery[keywords.project]) {
                throw new Error('Missing project keyword');
            }

            if (!parsedQuery[keywords.filter] || !parsedQuery[keywords.filter].length) {
                return this.getOutput()(this.data, parsedQuery[keywords.project]);
            }

            const data = this.getFilteredData(parsedQuery[keywords.filter], parsedQuery[keywords.project]);

            return this.getOutput()(data, parsedQuery[keywords.project]);
        } catch (error) {
            console.error('Failed to process query', error);

            return [];
        }
    }

    private getFilteredData(filters: Filter, queryCols: Project): Data {
        // TODO: handle AND, OR, NOT statements
        for (const filter of filters) {
            const { target, condition, value } = filter;

            if (!supportedOperators.includes(condition)) {
                throw new Error(`Invalid operator: ${condition}`);
            }

            if (!this.index.buckets[target]) {
                throw new Error(`Column not found: ${target}`);
            }

            switch (condition) {
                case '=':
                    return this.eqFilter(target, value, queryCols);
                case '<':
                    return this.ltFilter(target, Number(value), queryCols);
                case '<=':
                    return this.lteFilter(target, Number(value), queryCols);
                case '>':
                    return this.gtFilter(target, Number(value), queryCols);
                case '>=':
                    return this.gteFilter(target, Number(value), queryCols);
                default:
                    throw new Error(`Invalid operator: ${condition}`);
            }
        }

        return [];
    }

    private eqFilter(target: string, value: string | number, queryCols: Project): Data {
        const indexes = this.index.buckets[target][value];
        return indexes.map((index) => {
            return this.filteredColumns(this.data[index.rowIndex], queryCols);
        });
    }

    private ltFilter(target: string, value: number, queryCols: Project): Data {
        if (this.index.columnTypes[target] === 'string') {
            throw new Error(`Invalid operator for string type column: <`);
        }

        const firstIndex = binarySearch(this.index.orderedKeys[target] as number[], (v) => v < (value as number), true);
        const orderedValues = firstIndex === -1 ? [] : this.index.orderedKeys[target].slice(0, firstIndex + 1);
        const leftIndexes = orderedValues.flatMap((value) => this.index.buckets[target][value]).map((index) => index.rowIndex);
        return leftIndexes.map((index) => {
            return this.filteredColumns(this.data[index], queryCols);
        });
    }

    private lteFilter(target: string, value: number, queryCols: Project): Data {
        if (this.index.columnTypes[target] === 'string') {
            throw new Error(`Invalid operator for string type column: <=`);
        }

        const firstIndex = binarySearch(this.index.orderedKeys[target] as number[], (v) => v <= (value as number), true);
        console.log("=>(csv-search.ts:144) firstIndex", firstIndex);
        const orderedValues = firstIndex === -1 ? [] : this.index.orderedKeys[target].slice(0, firstIndex + 1);
        console.log("=>(csv-search.ts:146) this.index.orderedKeys[target]", this.index.orderedKeys[target]);
        console.log("=>(csv-search.ts:146) orderedValues", orderedValues);
        const leftIndexes = orderedValues.flatMap((value) => this.index.buckets[target][value]).map((index) => index.rowIndex);
        console.log("=>(csv-search.ts:148) leftIndexes", leftIndexes);
        return leftIndexes.map((index) => {
            return this.filteredColumns(this.data[index], queryCols);
        });
    }

    private gtFilter(target: string, value: number, queryCols: Project): Data {
        if (this.index.columnTypes[target] === 'string') {
            throw new Error(`Invalid operator for string type column: >`);
        }

        const firstIndex = binarySearch(this.index.orderedKeys[target] as number[], (v) => v > (value as number));
        const orderedValues = firstIndex === -1 ? [] : this.index.orderedKeys[target].slice(firstIndex);
        const rightIndexes = orderedValues.flatMap((value) => this.index.buckets[target][value]).map((index) => index.rowIndex);
        return rightIndexes.map((index) => {
            return this.filteredColumns(this.data[index], queryCols);
        });
    }

    private gteFilter(target: string, value: number, queryCols: Project): Data {
        if (this.index.columnTypes[target] === 'string') {
            throw new Error(`Invalid operator for string type column: >=`);
        }

        const firstIndex = binarySearch(this.index.orderedKeys[target] as number[], (v) => v >= (value as number));
        const orderedValues = firstIndex === -1 ? [] : this.index.orderedKeys[target].slice(firstIndex);
        const rightIndexes = orderedValues.flatMap((value) => this.index.buckets[target][value]).map((index) => index.rowIndex);
        return rightIndexes.map((index) => {
            return this.filteredColumns(this.data[index], queryCols);
        });
    }

    private filteredColumns(record: Record<string, string>, queryCols: Project): Record<string, string> {
        return queryCols.reduce((acc, key) => {
            return { ...acc, [key]: record[key] };
        }, {});
    }

    private getOutput(): (data: Record<string, string>[], keys: string[]) => Data {
        switch (this.outputFormat) {
            case outputFormats.json:
                return jsonOutput;
            case outputFormats.table:
                return tableOutput;
            default:
                throw new Error(`Invalid output format: ${this.outputFormat}`);
        }
    }
}