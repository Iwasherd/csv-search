export const keywords = {
    project: 'PROJECT',
    filter: 'FILTER',
} as const;

export type Project = string[];
export type Filter = { target: string; condition: string; value: string | number }[];

export type ParsedQuery = {
    PROJECT: Project;
    FILTER: Filter;
}

const matchRegex = /PROJECT\s+([^FILTER]+)\s+FILTER\s+(.+)/;

export class QueryParser {
    parse(query: TemplateStringsArray | string, ...keys: string[] | number[]): ParsedQuery {
        if (typeof query === 'string') {
            return this.parseString(query);
        }

        if (!query.length) {
            throw new Error(`Invalid query: ${query}`);
        }

        return this.parseTemplateStringsArray(query, keys);
    }

    /**
     * @param query - example: 'PROJECT col1, col2 FILTER col3 = 2'
     * @returns - example: { PROJECT: ['col1', 'col2'], FILTER: [{target: 'col3', condition: '=', value: '2'}] }
     */
    parseString(query: string): ParsedQuery {
        const parsedQuery: ParsedQuery = {
            [keywords.project]: [],
            [keywords.filter]: [],
        };


        const matches = query.match(matchRegex);

        if (!matches) {
            const [, project] = query.split(keywords.project);

            if (!project) {
                // TODO: handle AND, OR, NOT statements
                throw new Error(`AND, OR, NOT statements are not supported yet`);
            }

            parsedQuery.PROJECT.push(...project.split(',').map((col) => col.trim()));

            return parsedQuery;
        }

        const [, project, filter] = matches;

        parsedQuery.PROJECT.push(...project.split(',').map((col) => col.trim()));

        const filters = filter.split(' ');
        const [target, condition, key] = filters;
        parsedQuery.FILTER.push({ condition: condition, target: target, value: key });

        return parsedQuery;
    }


    /**
     *
     * @param query example: ['PROJECT col1, col2 FILTER col3 = ', '']
     * @param keys example: [2]
     * @returns example: { PROJECT: ['col1', 'col2'], FILTER: [{target: 'col3', condition: '=', value: '2'}] }
     */
    parseTemplateStringsArray(query: TemplateStringsArray, keys: string[] | number[]): ParsedQuery {
        const parsedQuery: ParsedQuery = {
            [keywords.project]: [],
            [keywords.filter]: [],
        };

        for (let i = 0; i < query.length; i++) {
            const matches = query[i].match(matchRegex);
            const key = keys[i];

            if (!matches) {
                const [, project] = query[i].split(keywords.project);

                if (!project) {
                    // TODO: handle AND, OR, NOT statements
                    continue;
                }

                parsedQuery.PROJECT.push(...project.split(',').map((col) => col.trim()));

                return parsedQuery;
            }

            const [, project, filter] = matches;

            parsedQuery.PROJECT.push(...project.split(',').map((col) => col.trim()));

            const [target, condition] = filter.split(' ');
            parsedQuery.FILTER.push({ condition: condition, target: target, value: key });
        }

        return parsedQuery;
    }
}