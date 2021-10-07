import { io as IO, Socket } from 'socket.io-client';
import { Process } from '../models/Process';
import { ProcessResult } from '../models/ProcessResult';
import { SearchioResponse } from '../models/SearchioResponse';
import { DataSourceName } from '../types/DataSourceName';
import { error, success } from './ResponseHandler';

export class SocketService {

    private socket: Socket;

    constructor() {}

    public async init(): Promise<SearchioResponse> {

        this.socket = IO('http://localhost:5000',{ transports: ["websocket"]});

        return new Promise((r, e) => {

            this.socket.on('connect', () => {
                r(success(`(SocketService) Websocket connected.`, { socketID: this.socket.id }));
            });
        
            this.socket.on('connect_error', (err) => {
                e(error(`(SocketService) Websocket could not connect.`, err));
            });
        })

    }

    public processUpdate(process: Process) {
        this.socket.emit("process-update", process);
    }

    public result(result: ProcessResult) {
        this.socket.emit("process-result", result);
    }
    

    public getID(): string {
        return this.socket.id;
    }

    public isConnected(): boolean {
        return this.socket.connected;
    }


}