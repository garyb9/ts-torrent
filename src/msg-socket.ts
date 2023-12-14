import dgram from 'dgram';
import { Buffer } from 'buffer';

export async function msgSocket(announcePath: string) {
    const url = new URL(announcePath);
    const socket = dgram.createSocket('udp4');
    const msgString = 'ping';
    const msg = Buffer.from(msgString, 'utf8');

    console.log(`Sending message to socket: ${msgString}`);

    socket.send(msg, 0, msg.length, Number(url.port), url.host, () => {});

    socket.on('message', msg => {
        console.log('message is', msg);
    });
}
