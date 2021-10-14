import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class DVLAProcess extends Process {

    protected id = "DVLAVehicleCheck";                   
    protected source: DataSourceName = "DVLA";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}