export function jsonOutput(data: Record<string, string>[]): Record<string, string>[] {
    console.info('Results:');
    console.log(JSON.stringify(data, null, 0));

    return data;
}