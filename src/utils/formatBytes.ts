export function formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = bytes / Math.pow(k, i);

    // Use 1 decimal place (e.g., 2.1 MB) or user-provided decimals
    const formattedValue = value.toFixed(decimals === 2 ? 1 : decimals);

    return `${formattedValue} ${sizes[i]}`;
}
