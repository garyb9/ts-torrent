import dgram from 'dgram';
import { Buffer } from 'buffer';
import {
    Address,
    AnnounceResponse,
    ConnectionResponse,
    TRACKER_MAGIC_CONSTANT,
    TorrentMetadata,
    TrackerResponseType,
} from './types';
import { randomBytes } from 'crypto';
import { group, genId } from './utils';
import { torrentInfoHash, torrentSize } from './torrent-parser';

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
            const announceReq = buildAnnounceReq(
                connResp.connectionId,
                torrent
            );
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

function respType(resp: Buffer): TrackerResponseType {
    const action = resp.readUInt32BE(0);
    if (action === 0) return 'connect';
    if (action === 1) return 'announce';
    else return null;
}

function buildConnReq(): Buffer {
    `
        Offset  Size            Name            Value
    0       32-bit integer  action          0 // connect
    4       32-bit integer  transaction_id
    8       64-bit integer  connection_id
    16
    `;
    const buf = Buffer.alloc(16);

    buf.writeBigInt64BE(BigInt(TRACKER_MAGIC_CONSTANT), 0); // Connection ID
    buf.writeUInt32BE(0, 8); // Action
    buf.writeUInt32BE(Math.floor(Math.random() * 0xffffffff), 12); // Transaction ID

    return buf;
}

function parseConnResp(resp: Buffer): ConnectionResponse {
    return {
        action: resp.readUInt32BE(0),
        transactionId: resp.readUInt32BE(4),
        connectionId: resp.readBigUInt64BE(8),
    } as ConnectionResponse;
}

function buildAnnounceReq(connId: any, torrent: TorrentMetadata): Buffer {
    `
        Offset  Size    Name    Value
    0       64-bit integer  connection_id
    8       32-bit integer  action          1 // announce
    12      32-bit integer  transaction_id
    16      20-byte string  info_hash
    36      20-byte string  peer_id
    56      64-bit integer  downloaded
    64      64-bit integer  left
    72      64-bit integer  uploaded
    80      32-bit integer  event           0 // 0: none; 1: completed; 2: started; 3: stopped
    84      32-bit integer  IP address      0 // default
    88      32-bit integer  key             ? // random
    92      32-bit integer  num_want        -1 // default
    96      16-bit integer  port            ? // should be between
    98
    `;

    const url = new URL((torrent?.announce ?? null).toString());
    const buf = Buffer.allocUnsafe(98);

    connId.copy(buf, 0); // connectionId
    buf.writeUInt32BE(1, 8); // action
    randomBytes(4).copy(buf, 12); // transaction id
    torrentInfoHash(torrent).copy(buf, 16); // info hash
    genId().copy(buf, 36); // peerId
    Buffer.alloc(8).copy(buf, 56); // downloaded
    torrentSize(torrent).copy(buf, 64); // left
    Buffer.alloc(8).copy(buf, 72); // uploaded
    buf.writeUInt32BE(0, 80); // event
    buf.writeUInt32BE(0, 80); // ip address
    randomBytes(4).copy(buf, 88); // key
    buf.writeInt32BE(-1, 92); // num want
    buf.writeUInt16BE(Number(url.port), 96); // port

    return buf;
}

function parseAnnounceResp(resp: Buffer): AnnounceResponse {
    `
        Offset      Size            Name            Value
    0           32-bit integer  action          1 // announce
    4           32-bit integer  transaction_id
    8           32-bit integer  interval
    12          32-bit integer  leechers
    16          32-bit integer  seeders
    20 + 6 * n  32-bit integer  IP address
    24 + 6 * n  16-bit integer  TCP port
    20 + 6 * N
    `;

    return {
        action: resp.readUInt32BE(0),
        transactionId: resp.readUInt32BE(4),
        leechers: resp.readUInt32BE(8),
        seeders: resp.readUInt32BE(12),
        peers: group(resp.subarray(20), 6).map((address: Address) => {
            return {
                ip: address.slice(0, 4).join('.'),
                port: address.readUInt16BE(4),
            };
        }),
    } as AnnounceResponse;
}
