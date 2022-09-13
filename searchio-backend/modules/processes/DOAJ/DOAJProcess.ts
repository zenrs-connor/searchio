import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class DOAJProcess extends Process {

    protected id = "DOAJ";                   
    protected source: DataSourceName = "DOAJ";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}