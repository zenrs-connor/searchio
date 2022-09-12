import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class CarbonDateProcess extends Process {

    protected id = "CarbonDateProcess";                   
    protected source: DataSourceName = "Carbon Date";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}
