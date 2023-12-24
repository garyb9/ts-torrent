import { Buffer } from 'buffer';
import { Payload, TorrentMetadata } from './types';
import { torrentInfoHash } from './torrent-parser';
import { genId } from './utils';

export function buildHandshake(torrent: TorrentMetadata): Buffer {
    `
    handshake: <pstrlen><pstr><reserved><info_hash><peer_id>

    pstrlen: string length of <pstr>, as a single raw byte
    pstr: string identifier of the protocol
    reserved: eight (8) reserved bytes. All current implementations use all zeroes.
    peer_id: 20-byte string used as a unique ID for the client.

    In version 1.0 of the BitTorrent protocol, pstrlen = 19, and pstr = "BitTorrent protocol".
    `;
    const buf = Buffer.alloc(68);

    buf.writeUInt8(19, 0); // pstrlen
    buf.write('BitTorrent protocol', 1); // pstr
    buf.writeUInt32BE(0, 20); // reserved
    buf.writeUInt32BE(0, 24); // reserved
    torrentInfoHash(torrent).copy(buf, 28); // info hash
    buf.write(genId().toString()); // peer id
    return buf;
}

export const buildKeepAlive = (): Buffer => Buffer.alloc(4);

export function buildChoke(): Buffer {
    const buf = Buffer.alloc(5);

    buf.writeUInt32BE(1, 0); // length
    buf.writeUInt8(0, 4); // id
    return buf;
}

export function buildUnchoke(): Buffer {
    const buf = Buffer.alloc(5);

    buf.writeUInt32BE(1, 0); // length
    buf.writeUInt8(1, 4); // id
    return buf;
}

export function buildInterested(): Buffer {
    const buf = Buffer.alloc(5);

    buf.writeUInt32BE(1, 0); // length
    buf.writeUInt8(2, 4); // id
    return buf;
}

export function buildUninterested(): Buffer {
    const buf = Buffer.alloc(5);

    buf.writeUInt32BE(1, 0); // length
    buf.writeUInt8(3, 4); // id
    return buf;
}

export function buildHave(payload: Payload): Buffer {
    const buf = Buffer.alloc(9);

    buf.writeUInt32BE(5, 0); // length
    buf.writeUInt8(4, 4); // id
    buf.writeUInt32BE(payload.index, 5); // piece index
    return buf;
}

export function buildBitfield(payload: Payload, bitfield: Buffer): Buffer {
    const buf = Buffer.alloc(14);

    buf.writeUInt32BE(payload.length + 1, 0); // length
    buf.writeUInt8(5, 4); // id
    bitfield.copy(buf, 5); // bitfield
    return buf;
}

export function buildRequest(payload: Payload): Buffer {
    const buf = Buffer.alloc(17);

    buf.writeUInt32BE(13, 0); // length
    buf.writeUInt8(6, 4); // id
    buf.writeUInt32BE(payload.index, 5); // piece index
    buf.writeUInt32BE(payload.begin, 9); // begin
    buf.writeUInt32BE(payload.length, 13); // length
    return buf;
}

export function buildPiece(payload: Payload): Buffer {
    const buf = Buffer.alloc(payload.block.length + 13);

    buf.writeUInt32BE(payload.block.length + 9, 0); // length
    buf.writeUInt8(7, 4); // id
    buf.writeUInt32BE(payload.index, 5); // piece index
    buf.writeUInt32BE(payload.begin, 9); // begin
    payload.block.copy(buf, 13); // block
    return buf;
}

export function buildCancel(payload: Payload): Buffer {
    const buf = Buffer.alloc(17);

    buf.writeUInt32BE(13, 0); // length
    buf.writeUInt8(8, 4); // id
    buf.writeUInt32BE(payload.index, 5); // piece index
    buf.writeUInt32BE(payload.begin, 9); // begin
    buf.writeUInt32BE(payload.length, 13); // length
    return buf;
}

export function buildPort(payload: Payload): Buffer {
    const buf = Buffer.alloc(7);

    buf.writeUInt32BE(3, 0); // length
    buf.writeUInt8(9, 4); // id
    buf.writeUInt16BE(payload.listen, 5); // listen-port
    return buf;
}

// export function parseMessage(msg: Buffer) {
//     const id = msg.length > 4 ? msg.readInt8(4) : null;
//     let payload = msg.length > 5 ? msg.subarray(5) : null;
//     if (id === 6 || id === 7 || id === 8) {
//         const rest = payload.subarray(8);
//         payload = {
//             index: payload.readInt32BE(0),
//             begin: payload.readInt32BE(4),
//         };
//         payload[id === 7 ? 'block' : 'length'] = rest;
//     }

//     return {
//         size: msg.readInt32BE(0),
//         id: id,
//         payload: payload,
//     };
// }
