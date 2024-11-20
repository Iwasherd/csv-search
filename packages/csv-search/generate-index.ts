type RawRecord = Record<string, string | number>;
interface BucketValue {
    orderedIndex: number;
    rowIndex: number;
}
type Bucket = Record<string | number, BucketValue[]>;
type Buckets = Record<string, Bucket>;
type OrderedKeys = Record<string, (string | number)[]>;
type ColumnTypes = Record<string, string>;

export interface Index {
    buckets: Buckets;
    columnTypes: ColumnTypes;
    orderedKeys: OrderedKeys;
}

/*
 total complexity: O(cols * (cols * log(cols) + cols) * rows) = O(cols^2 * log(cols) * rows)
*/
export function* indexGenerator(): Generator<Index | undefined> {
    const buckets: Buckets = {};
    let rowIndex = 0;
    const columnTypes: ColumnTypes = {};
    const orderedKeys: OrderedKeys = {};

    const index = {
        buckets,
        columnTypes,
        orderedKeys,
    };

    try {
        while (true) {
            const record: RawRecord = (yield index) as RawRecord;
            if (!record) return index;

            for (const key in record) {
                if (!buckets[key]) {
                    buckets[key] = {};
                }

                let value = record[key];
                value = parseInt(value as string) || value;
                // edge case for 0
                value = value === '0' ? 0 : value;

                switch (typeof value) {
                case 'string':
                    columnTypes[key] = 'string';
                    break;
                case 'number':
                    columnTypes[key] = 'number';
                    break;
                default:
                    throw new Error(`Invalid column type: ${typeof value}`);
                }

                if (!buckets[key][value]) {
                    buckets[key][value] = [];
                    orderedKeys[key] = orderedKeys[key] || [];
                    orderedKeys[key].push(value);
                    orderedKeys[key].sort((a, b) => {
                        if (typeof a === 'string' && typeof b === 'string') {
                            return a.localeCompare(b);
                        }

                        if (typeof a === 'number' && typeof b === 'number') {
                            return a - b;
                        }

                        return typeof a === 'string' ? -1 : 1;
                    });
                }

                buckets[key][value].push({ rowIndex, orderedIndex: 0 });
                updateOrderedIndex(key, orderedKeys, buckets);
            }

            rowIndex++;
        }
    } catch (e) {
        throw new Error(`indexGenerator error: ${e}`);
    }
}

function updateOrderedIndex(key: string | number, orderedKeys: OrderedKeys, buckets: Buckets) {
    Object.keys(buckets[key]).forEach((value) => {
        const _value = parseInt(value) || value;
        buckets[key][_value].forEach((bucketValue) => {
            bucketValue.orderedIndex = orderedKeys[key].indexOf(_value);
        });
    });
}