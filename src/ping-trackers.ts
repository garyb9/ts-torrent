import * as fs from 'fs';
import * as path from 'path';
import dgram from 'dgram';
import { Buffer } from 'buffer';
import { URL } from 'url';
import axios from 'axios';
import { Results } from './types';

// Function to check HTTP/S trackers
async function checkHttpTracker(trackerUrl: string): Promise<boolean> {
    const params = new URLSearchParams({
        info_hash: '<info_hash>', // 20-byte SHA1 hash of the torrent info dictionary
        peer_id: '<peer_id>', // 20-byte peer ID
        port: '6881', // Port number the client is listening on
        uploaded: '0', // Total amount uploaded
        downloaded: '0', // Total amount downloaded
        left: '0', // Amount left to download
        compact: '1', // Compact response format
    });

    const announceUrl = trackerUrl.endsWith('/announce')
        ? trackerUrl
        : `${trackerUrl}/announce`;

    try {
        const response = await axios.get(announceUrl, { params });
        console.log(`Tracker response: ${response.data}`);
        return true;
    } catch (error) {
        console.error(`Error contacting tracker: ${error}`);
        return false;
    }
}

// Function to check UDP trackers
function checkUdpTracker(
    trackerUrl: string,
    msgString: string,
    timeoutDuration: number = 10000,
    callback: (resp: any) => void
): void {
    const url = new URL(trackerUrl);
    const socket = dgram.createSocket('udp4');

    const announceUrl = trackerUrl.endsWith('/announce')
        ? trackerUrl
        : `${trackerUrl}/announce`;

    const messageBuffer = Buffer.from(msgString, 'utf8');

    console.log(`Pinging tracker: ${announceUrl}`);

    socket.send(
        messageBuffer,
        0,
        messageBuffer.length,
        parseInt(url.port),
        url.hostname,
        err => {
            if (err) {
                console.error(`Socket send error: ${err}`);
                socket.close();
            }
        }
    );

    const timeout = setTimeout(() => {
        console.log(`Reached timeout for ${announceUrl}`);
        socket.close();
    }, timeoutDuration);

    socket.on('message', response => {
        console.log(
            `Received response from ${announceUrl}: ${response.toString(
                'utf8'
            )}`
        );
        callback(response);
        clearTimeout(timeout);
        socket.close();
    });

    socket.on('error', err => {
        console.error(`Received error response from ${announceUrl}: ${err}`);
        clearTimeout(timeout);
        socket.close();
    });
}

export async function testTrackerUrls(trackerUrls: string[]) {
    const timeoutDuration = 10000; // 10 seconds in milliseconds
    const results: Results = {};
    const msgString = 'ping';

    for (let trackerUrl of trackerUrls) {
        const trackerUrlParsed = new URL(trackerUrl);
        if (trackerUrlParsed.protocol.includes('udp')) {
            checkUdpTracker(trackerUrl, msgString, timeoutDuration, resp => {
                results[trackerUrl] = resp;
            });
        } else if (trackerUrlParsed.protocol.includes('http')) {
            // TODO: add http/s ping
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
    testTrackerUrls(trackersList).then(results => console.log(results));
}
