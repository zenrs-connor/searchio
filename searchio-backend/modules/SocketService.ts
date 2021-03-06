import { io as IO, Socket } from 'socket.io-client';
import { ProcessData } from '../models/ProcessData';
import { ProcessResult } from '../models/ProcessResult';
import { QueryStatus } from '../models/QueryStatus';
import { SearchioResponse } from '../models/SearchioResponse';
import { DataSourceName } from '../types/DataSourceName';
import { error, success } from './ResponseHandler';

export class SocketService {

    private socket: Socket;

    constructor() {}

    public async init(): Promise<SearchioResponse> {

        this.socket = IO('http://localhost:3002',{ transports: ["websocket"]});

        return new Promise((r, e) => {

            this.socket.on('connect', () => {
                r(success(`(SocketService) Websocket connected.`, { socketID: this.socket.id }));
            });
        
            this.socket.on('connect_error', (err) => {
                e(error(`(SocketService) Websocket could not connect.`, err));
            });
        })

    }

    public processUpdate(process: ProcessData) {
        this.socket.emit("process-update", process);
    }

    public queryUpdate(status: QueryStatus) {
        this.socket.emit("query-update", status);
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