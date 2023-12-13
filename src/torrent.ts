import * as fs from 'fs';
import * as path from 'path';
import bencodec from 'bencodec';
import { convertBuffersToStrings } from './utils'


export function openTorrent(torrentPath: string): unknown {
    try {
        const torrent: Buffer = fs.readFileSync(torrentPath);
        const decoded = bencodec.decode(torrent);
        console.log(convertBuffersToStrings(decoded));
        return decoded;
    } catch (error) {
        console.error(`Error opening ${torrentPath}:\n${error}`);
    }
    
}