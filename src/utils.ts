export function convertBuffersToStrings(obj: any): any {
    if (Buffer.isBuffer(obj)) {
        // Convert Buffer to string
        return obj.toString('utf-8'); // or 'hex', 'base64' depending on your data
    } else if (Array.isArray(obj)) {
        // Recursively process each element in the array
        return obj.map(convertBuffersToStrings);
    } else if (typeof obj === 'object' && obj !== null) {
        // Recursively process each property in the object
        const newObj: any = {};
        for (const [key, value] of Object.entries(obj)) {
            newObj[key] = convertBuffersToStrings(value);
        }
        return newObj;
    }
    // Return the value unchanged if it's not a Buffer, Array, or Object
    return obj;
}

export function generateRandomString(length: number): string {
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }
    return result;
}
