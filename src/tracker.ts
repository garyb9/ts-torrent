import dgram from 'dgram';
import { Buffer } from 'buffer';
import { AnnounceResponse, ConnectionResponse, TorrentMetadata } from './types';

export function getPeers(
    torrent: TorrentMetadata,
    callback: (peers: any) => void
): void {
    const socket = dgram.createSocket('udp4');
    const url = (torrent?.announce ?? null).toString();

    // send connection request
    udpSend(socket, buildConnReq(), url);

    socket.on('message', response => {
        if (respType(response) === 'connect') {
            // receive and parse connect response
            const connResp = parseConnResp(response);
            // send announce request
            const announceReq = buildAnnounceReq(connResp.connectionId);
            udpSend(socket, announceReq, url);
        } else if (respType(response) === 'announce') {
            // parse announce response
            const announceResp = parseAnnounceResp(response);
            // pass peers to callback
            callback(announceResp.peers);
        } else {
            console.log(response);
        }
    });
}

function udpSend(
    socket: dgram.Socket,
    message: Buffer,
    rawUrl: string,
    callback: () => void = () => {}
): void {
    const url = new URL(rawUrl);

    socket.send(
        message,
        0,
        message.length,
        Number(url.port),
        url.host,
        callback
    );
}

function respType(resp: Buffer): string {
    // ...
    return ''; // placeholder return, replace with your implementation
}

function buildConnReq(): Buffer {
    // ...
    return Buffer.alloc(0); // placeholder return, replace with your implementation
}

function parseConnResp(resp: Buffer): ConnectionResponse {
    // ...
    return {} as ConnectionResponse; // placeholder return, replace with your implementation
}

function buildAnnounceReq(connId: any): Buffer {
    // ...
    return Buffer.alloc(0); // placeholder return, replace with your implementation
}

function parseAnnounceResp(resp: Buffer): AnnounceResponse {
    // ...
    return {} as AnnounceResponse; // placeholder return, replace with your implementation
}
