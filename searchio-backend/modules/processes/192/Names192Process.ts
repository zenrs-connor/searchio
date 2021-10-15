import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class Names192Process extends Process {

    protected id = "Names192";                   
    protected source: DataSourceName = "192";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}