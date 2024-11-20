**Description**
This is a simple implementation of csv searcher.
Example of usage:

```typescript
const csvSearcher = new CsvSearcher();
csvSearcher.loadCsv('path/to/csv/file.csv')

const result = csvSearcher.search`Project col1, col2 Filter col3 = 'value'`
```

result will be an array of objects that match the filter and represents satisfied columns. And wrote into stdout.

**How to run locally**

1. Clone the repository
2. Use node version >= 20.18.0
3. Run `npm install`
4. Run `npm test` to run the tests

**Tradeoffs**

- Current implementation has complex insert operation. But optimized search operation. In my option, this is acceptable
  tradeoff for now because search operation is more frequent than insert operation.
- Planned optimizations:
    - Implementing a cache for search results
    - Using b+ tree for storing indexes
    - Using a better search algorithm for search operation
    - Avoid indexing all columns value to save memory
- Changed to support other data types:
    - Add strict type for whole column, and depends on the context use operators to compare values
- Changes to support multiple filters:
    - Update parser to read multiple filters and use composed indexes to search
- Changes to support ordering of results:
    - Add an order by clause to the search query
- Changes to process extremely large datasets:
    - Not keep all indexes in memory and write indexes to disk
    - Use a b+ tree for storing indexes and save memory
    - Use bucketing for storing indexes
- To make this code production ready:
  - Write documentation
  - Maybe create eslint plugin for query language highlighting
  - Deploy it as library or package
  - Add more unit tests