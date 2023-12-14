import * as path from 'path';
import { openTorrent } from './torrent';
import { msgSocket } from './msg-socket';
import app from './server';
import { getPeers } from './tracker';

async function main() {
    const torrentPath: string = path.join(
        __dirname,
        '..',
        'public',
        '924F1C9B89F7543DBBA5CA0E30A5CF4F2E112360.torrent'
    );
    const torrent = openTorrent(torrentPath);

    getPeers(torrent, peers => {
        console.log('list of peers: ', peers);
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}/`);
    });
}

main()
    // .then(() => {
    //   console.log('Application finished successfully');
    // })
    .catch(error => {
        console.error('Application encountered an error:', error);
        process.exit(1);
    });
