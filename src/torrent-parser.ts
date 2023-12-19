import * as fs from 'fs';
import bencodec from 'bencodec';
import { convertBuffersToStrings } from './utils';
import { TorrentMetadata } from './types';
import { Buffer } from 'buffer';
import { createHash } from 'crypto';
import { toBufferBE } from 'bigint-buffer';

export function openTorrentFile(torrentPath: string): TorrentMetadata | any {
    try {
        const torrent: Buffer = fs.readFileSync(torrentPath);
        const decoded = bencodec.decode(torrent);
        const decodedObject = convertBuffersToStrings(decoded);
        console.log(decodedObject);
        return decodedObject as TorrentMetadata;
    } catch (error) {
        console.error(`Error opening ${torrentPath}:\n${error}`);
    }
}

export function torrentSize(torrent: TorrentMetadata): Buffer {
    const info = bencodec.encode(torrent.info);
    return createHash('sha1').update(info).digest();
}

export function torrentInfoHash(torrent: TorrentMetadata): Buffer {
    const size = torrent.info.files
        .map(file => file.length)
        .reduce((a, b) => a + b);

    return toBufferBE(size, 8);
}
