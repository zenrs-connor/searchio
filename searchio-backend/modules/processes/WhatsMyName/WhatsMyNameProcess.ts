import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class WhatsMyNameProcess extends Process {

    protected id = "WhatsMyName";                   
    protected source: DataSourceName = "WhatsMyName";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}