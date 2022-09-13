import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class ERICProcess extends Process {

    protected id = "ERIC";                   
    protected source: DataSourceName = "ERIC";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}