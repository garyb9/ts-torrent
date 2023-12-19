export const TRACKER_MAGIC_CONSTANT = 0x41727101980;

export interface TorrentFile {
    // Define the structure of each file object here, if known.
    // For instance, if each file has 'name' and 'size', use:
    // name: string;
    // size: number;
    // Replace with actual structure if known.
    [key: string]: any; // Generic catch-all type if structure is unknown.
}

export interface TorrentInfo {
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

export interface ConnectionResponse {
    action: number;
    transactionId: number;
    connectionId: bigint;
}

export interface AnnounceResponse {
    action: number;
    transactionId: number;
    leechers: number;
    seeders: number;
    peers: any[]; // Define the structure of peers
}

export interface Results {
    [key: string]: string;
}

export type TrackerResponseType = 'connect' | 'announce' | null;

// export type Callback = (resp: string | null, err: string | null) => void;

export interface Callback {
    (resp: string, err: null): void;
    (resp: null, err: string): void;
}

export interface Address {
    slice: (arg0: number, arg1: number) => any[];
    readUInt16BE: (arg0: number) => any;
}
