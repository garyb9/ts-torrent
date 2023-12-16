import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import dgram from 'dgram';
import { Buffer } from 'buffer';
import { URL } from 'url';
import { Callback, Results } from './types';
import { generateRandomString } from './utils';
import { randomBytes } from 'crypto';

const TRACKER_MAGIC_CONSTANT = 0x41727101980;
const ACTION_CONNECT = 0;
const TRANSACTION_ID = Math.floor(Math.random() * 0xffffffff);

// Function to check HTTP/S trackers
async function checkHttpTracker(
    trackerUrl: string,
    timeoutDuration: number = 10000,
    callback: Callback
): Promise<void> {
    const params = new URLSearchParams({
        info_hash: randomBytes(20).toString('utf-8'), // 20-byte SHA1 hash of the torrent info dictionary
        peer_id: `-qB4390-${generateRandomString(12)}`, // 20-byte peer ID
        port: '6881', // Port number the client is listening on
        uploaded: '0', // Total amount uploaded
        downloaded: '0', // Total amount downloaded
        left: '0', // Amount left to download
        compact: '1', // Compact response format
    });

    const announceUrl = trackerUrl.endsWith('/announce')
        ? trackerUrl
        : `${trackerUrl}/announce`;

    axios
        .get(announceUrl, {
            params,
            timeout: timeoutDuration,
        })
        .then(response => {
            callback(
                `${announceUrl} -> Received response: ${response.data}`,
                null
            );
        })
        .catch(error => {
            let err: string;
            if (
                error.code === 'ECONNABORTED' &&
                error.message.includes('timeout')
            ) {
                err = `${announceUrl} -> Reached timeout`;
            } else {
                err = `${announceUrl} -> Received error: ${error}`;
            }
            callback(null, err);
        });
}

// Function to check UDP trackers
function checkUdpTracker(
    trackerUrl: string,
    timeoutDuration: number = 10000,
    callback: (resp: string | null, err: string | null) => void
): void {
    const url = new URL(trackerUrl);
    const socket = dgram.createSocket('udp4');

    const announceUrl = trackerUrl.endsWith('/announce')
        ? trackerUrl
        : `${trackerUrl}/announce`;

    const connectRequest = Buffer.alloc(16);
    connectRequest.writeBigInt64BE(BigInt(TRACKER_MAGIC_CONSTANT), 0); // Connection ID
    connectRequest.writeUInt32BE(ACTION_CONNECT, 8); // Action
    connectRequest.writeUInt32BE(TRANSACTION_ID, 12); // Transaction ID

    console.log(`Pinging tracker: ${announceUrl}`);

    socket.send(
        connectRequest,
        0,
        connectRequest.length,
        parseInt(url.port),
        url.hostname,
        err => {
            if (err) {
                console.log(`${announceUrl} -> Socket send error: ${err}`);
                socket.close();
            }
        }
    );

    const timeout = setTimeout(() => {
        console.log(`${announceUrl} -> Reached timeout`);
        socket.close();
    }, timeoutDuration);

    socket.on('message', response => {
        callback(
            `${announceUrl} -> Received response: ${response.toString('utf8')}`,
            null
        );
        clearTimeout(timeout);
        socket.close();
    });

    socket.on('error', err => {
        callback(null, `${announceUrl} -> Received error: ${err}`);
        clearTimeout(timeout);
        socket.close();
    });
}

export async function testTrackerUrls(trackerUrls: string[]) {
    const timeoutDuration = 10000; // 10 seconds in milliseconds
    const results: Results = {};

    for (let trackerUrl of trackerUrls) {
        const trackerUrlParsed = new URL(trackerUrl);

        const callback: Callback = (resp, err) => {
            if (resp && err === null) {
                console.log(resp);
                results[trackerUrl] = resp;
            } else if (resp === null && err) {
                console.error(err);
                results[trackerUrl] = err;
            }
        };

        if (trackerUrlParsed.protocol.includes('udp')) {
            // checkUdpTracker(trackerUrl, timeoutDuration, callback);
        } else if (trackerUrlParsed.protocol.includes('http')) {
            await checkHttpTracker(trackerUrl, timeoutDuration, callback);
        }
    }

    return results;
}

if (require.main === module) {
    // if run directly - load trackers list
    const trackersPath: string = path.join(__dirname, '../data/trackers.json');
    const trackersFile = fs.readFileSync(trackersPath, 'utf8');
    const trackersList = JSON.parse(trackersFile);

    // run ping script
    testTrackerUrls(trackersList).then(results => {
        const resultsJson = JSON.stringify(results, null, 4);

        fs.writeFile('ping-results.json', resultsJson, 'utf8', function (err) {
            if (err) {
                console.log(
                    'An error occured while writing JSON Object to File.'
                );
                return console.log(err);
            }

            console.log('JSON file has been saved.');
        });
    });
}
