import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class ForeverMissedProcess extends Process {

    protected id = "ForeverMissed";                   
    protected source: DataSourceName = "ForeverMissed";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}