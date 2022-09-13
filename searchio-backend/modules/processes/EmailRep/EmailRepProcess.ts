import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class EmailRepProcess extends Process {

    protected id = "EmailRepProcess";                   
    protected source: DataSourceName = "EmailRep";

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}