interface TorrentFile {
    // Define the structure of each file object here, if known.
    // For instance, if each file has 'name' and 'size', use:
    // name: string;
    // size: number;
    // Replace with actual structure if known.
    [key: string]: any; // Generic catch-all type if structure is unknown.
}

interface TorrentInfo {
    files: TorrentFile[];
    name: string;
    'piece length': number;
    pieces: string;
}

export interface TorrentMetadata {
    announce: string;
    'announce-list': string[][];
    comment: string;
    'created by': string;
    'creation date': number;
    info: TorrentInfo;
}
