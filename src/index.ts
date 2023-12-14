import * as path from 'path';
import { openTorrent } from './torrent';
import app from './server';
import dgram from 'dgram';
import { Buffer } from 'buffer';

const torrentPath: string = path.join(
  __dirname,
  '..',
  'public',
  '924F1C9B89F7543DBBA5CA0E30A5CF4F2E112360.torrent'
);
const decoded = openTorrent(torrentPath);
const url = new URL((decoded?.announce ?? null).toString('utf8'));
const socket = dgram.createSocket('udp4');
const myMsg = Buffer.from('hello?', 'utf8');

socket.send(myMsg, 0, myMsg.length, Number(url.port), url.host, () => {});

socket.on('message', msg => {
  console.log('message is', msg);
});

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running at http://localhost:${PORT}/`);
// });
