import { SearchioResponse } from "../models/SearchioResponse";
import { SocketService } from "./SocketService";

export class ResponseEmitter {


    protected id: string = "Unammed Emitter";
    protected socket: SocketService;

    constructor(socket: SocketService) {
        this.socket = socket;
    }

    protected success(message: string, data: any = undefined): SearchioResponse {
        return { 
            success: true,
            message: `(${this.id}) ${message}`,
            data: data
        }
    }

    protected error(message: string, data: any = undefined): SearchioResponse {
        return { 
            success: false,
            message: `(${this.id}) ERROR: ${message}`,
            data: data
        }
    }

}