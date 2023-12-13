import * as fs from 'fs';
import * as path from 'path';
import bencodec from 'bencodec';

const torrentPath: string = path.join(__dirname, '..', 'public', '924F1C9B89F7543DBBA5CA0E30A5CF4F2E112360.torrent');
const torrent: Buffer = fs.readFileSync(torrentPath);
const decoded = bencodec.decode(torrent);
console.log(decoded);