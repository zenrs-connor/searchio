import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class OpenCorporatesProcess extends Process {

    protected id = "OpenCorporates";                   
    protected source: DataSourceName = "Open Corporates";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}