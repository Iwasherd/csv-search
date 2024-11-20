export function tableOutput(data: Record<string, string>[], keys: string[]): Record<string, string>[] {
    console.info('Results:');
    console.table(data, keys);

    return data;
}