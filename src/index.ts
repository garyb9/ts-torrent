import * as path from 'path';
import { openTorrentFile } from './torrent-parser';
import download from './download';

async function main() {
    const torrentPath: string = path.join(
        __dirname,
        '../public/924F1C9B89F7543DBBA5CA0E30A5CF4F2E112360.torrent'
    );
    const torrent = openTorrentFile(torrentPath);

    download(torrent);

    // const PORT = process.env.PORT || 3000;
    // app.listen(PORT, () => {
    //     console.log(`Server is running at http://localhost:${PORT}/`);
    // });
}

main()
    // .then(() => {
    //   console.log('Application finished successfully');
    // })
    .catch(error => {
        console.error('Application encountered an error:', error);
        process.exit(1);
    });
