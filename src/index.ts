import * as fs from 'fs';
import * as path from 'path';

const torrentPath: string = path.join(__dirname, '..', 'public', 'puppy.torrent');
const torrent: Buffer = fs.readFileSync(torrentPath);
console.log(torrent.toString('utf8'));