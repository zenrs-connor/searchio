import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class HIBPProcess extends Process {

    protected id = "HIBP";                   
    protected source: DataSourceName = "HIBP";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}