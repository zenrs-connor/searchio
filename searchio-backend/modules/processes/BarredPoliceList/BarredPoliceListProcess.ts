import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class BarredPoliceListProcess extends Process {

    protected id = "BarredPoliceList";                   
    protected source: DataSourceName = "Barred Police List";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}