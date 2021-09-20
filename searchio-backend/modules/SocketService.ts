import { io as IO, Socket } from 'socket.io-client';

export class SocketService {

    private socket: Socket;


    constructor() {

        this.socket = IO('http://localhost:5000',{ transports: ["websocket"]});

        this.socket.on('connect', () => {
            console.log("Module WebSocket Connection", this.socket.id);
        });
    
        this.socket.on('connect_error', (err) => {
            console.log("Module socket connection error", err);
        });

    }

    public getID(): string {
        return this.socket.id;
    }

    public isConnected(): boolean {
        return this.socket.connected;
    }


}