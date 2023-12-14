import * as fs from 'fs';
import * as path from 'path';
import bencodec from 'bencodec';
import { convertBuffersToStrings } from './utils';
import { TorrentMetadata } from './types';

export function openTorrent(torrentPath: string): TorrentMetadata | any {
    try {
        const torrent: Buffer = fs.readFileSync(torrentPath);
        const decoded = bencodec.decode(torrent);
        const decodedObject = convertBuffersToStrings(decoded);
        // console.log(decodedObject);
        return decodedObject as TorrentMetadata;
    } catch (error) {
        console.error(`Error opening ${torrentPath}:\n${error}`);
    }
}
