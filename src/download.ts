import net from 'net';
import { Buffer } from 'buffer';
import { getPeers } from './tracker';
import { TorrentMetadata } from './types';

function downloadFromPeer(peer: any) {
    const socket = new net.Socket();
    socket.on('error', console.log);
    socket.connect(peer.port, peer.ip, () => {
        // socket.write(...) write a message here
    });
    socket.on('data', data => {
        // handle response here
    });
}

export function downloadTorrentFromPeers(torrent: TorrentMetadata) {
    getPeers(torrent, peers => {
        peers.array.forEach((peer: any) => {
            downloadFromPeer(peer);
        });
    });
}

export default downloadTorrentFromPeers;
