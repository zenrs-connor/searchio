import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class OpenOwnershipProcess extends Process {

    protected id = "OpenOwnership";                   
    protected source: DataSourceName = "OpenOwnership";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}