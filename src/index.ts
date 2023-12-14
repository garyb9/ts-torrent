import * as path from 'path';
import { openTorrent } from './torrent';
import app from './server';
import dgram from 'dgram';
import { Buffer } from 'buffer';
import { parse as urlParse } from 'url';

const torrentPath: string = path.join(
  __dirname,
  '..',
  'public',
  '924F1C9B89F7543DBBA5CA0E30A5CF4F2E112360.torrent'
);
const decoded = openTorrent(torrentPath);
console.log(decoded?.announce ?? null);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/`);
});
