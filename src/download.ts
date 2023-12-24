import { Socket } from 'net';
import { Buffer } from 'buffer';
import { getPeers } from './tracker';
import { TorrentMetadata } from './types';
import * as message from './message';

export function downloadTorrentFromPeers(torrent: TorrentMetadata) {
    getPeers(torrent, peers => {
        peers.array.forEach((peer: any) => {
            downloadFromPeer(peer, torrent);
        });
    });
}

function downloadFromPeer(peer: any, torrent: TorrentMetadata) {
    const socket = new Socket();
    socket.on('error', console.log);
    socket.connect(peer.port, peer.ip, () => {
        socket.write(message.buildHandshake(torrent));
    });
    onWholeMessage(socket, msg => messageHandler(msg, socket));
    socket.on('data', data => {
        // handle response here
    });
}

function messageHandler(msg: Buffer, socket: Socket) {
    if (isHandshake(msg)) socket.write(message.buildInterested());
}

function isHandshake(msg: Buffer) {
    return (
        msg.length === msg.readUInt8(0) + 49 &&
        msg.toString('utf8', 1) === 'BitTorrent protocol'
    );
}

function onWholeMessage(socket: Socket, callback: (buff: Buffer) => any) {
    let savedBuf = Buffer.alloc(0);
    let handshake = true;

    socket.on('data', (recvBuf: Uint8Array) => {
        // msgLen calculates the length of a whole message
        const msgLen = () =>
            handshake
                ? savedBuf.readUInt8(0) + 49
                : savedBuf.readInt32BE(0) + 4;
        savedBuf = Buffer.concat([savedBuf, recvBuf]);

        while (savedBuf.length >= 4 && savedBuf.length >= msgLen()) {
            callback(savedBuf.subarray(0, msgLen()));
            savedBuf = savedBuf.subarray(msgLen());
            handshake = false;
        }
    });
}

export default downloadTorrentFromPeers;
