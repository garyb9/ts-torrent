import * as path from 'path';
import { openTorrent } from './torrent';
import { msgSocket } from './msg-socket';
import app from './server';

async function main() {
    const torrentPath: string = path.join(
        __dirname,
        '..',
        'public',
        '924F1C9B89F7543DBBA5CA0E30A5CF4F2E112360.torrent'
    );
    const decoded = openTorrent(torrentPath);
    const announcePath = (decoded?.announce ?? null).toString('utf8');
    await msgSocket(announcePath);

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
