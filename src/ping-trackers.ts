import * as fs from 'fs';
import * as path from 'path';
import dgram from 'dgram';
import { Buffer } from 'buffer';

interface Results {
    [key: string]: string;
}

export async function testUrls(urls: string[]) {
    const timeoutDuration = 10000; // 10 seconds in milliseconds
    const results: Results = {};

    const socket = dgram.createSocket('udp4');
    const msgString = 'ping';
    const msg = Buffer.from(msgString, 'utf8');

    for (let announcePath of urls) {
        await new Promise<void>(resolve => {
            try {
                const url = new URL(announcePath);

                console.log(`Pinging tracker: ${announcePath}`);

                socket.send(
                    msg,
                    0,
                    msg.length,
                    Number(url.port),
                    url.host,
                    () => {}
                );

                const timeout = setTimeout(() => {
                    console.log(`Timeout for ${announcePath}`);
                    results[announcePath] = 'Timeout';
                    socket.close();
                    resolve();
                }, timeoutDuration);

                socket.on('message', msg => {
                    console.log(`Received message from ${announcePath}:`, msg);
                    results[announcePath] = 'Received response';
                    clearTimeout(timeout);
                    socket.close();
                    resolve();
                });

                socket.on('error', err => {
                    console.log(`Error for ${announcePath}:`, err);
                    results[announcePath] = 'Error';
                    clearTimeout(timeout);
                    socket.close();
                    resolve();
                });
            } catch (error) {
                results[announcePath] = `Socket Error: ${error}`;
                // clearTimeout(timeout);
                socket.close();
                resolve();
            }
        });
    }

    return results;
}

if (require.main === module) {
    // if run directly - load trackers list
    const trackersPath: string = path.join(__dirname, '../data/trackers.json');
    const trackersFile = fs.readFileSync(trackersPath, 'utf8');
    const trackersList = JSON.parse(trackersFile);

    // run ping script
    testUrls(trackersList).then(results => console.log(results));
}
