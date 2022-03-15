import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class WaybackMachineProcess extends Process {

    protected id = "WaybackMachine";                   
    protected source: DataSourceName = "Wayback Machine";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}