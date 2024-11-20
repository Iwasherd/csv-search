export function binarySearch(arr: number[], condition: (value: number) => boolean, fromEnd = false): number {
    let left = 0;
    let right = arr.length - 1;
    let result = -1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (condition(arr[mid])) {
            result = mid;
            if (fromEnd) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        } else {
            if (fromEnd) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
    }

    return result;
}