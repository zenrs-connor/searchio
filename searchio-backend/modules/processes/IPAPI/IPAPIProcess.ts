import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class IPAPIProcess extends Process {

    protected id = "IPAPI";                   
    protected source: DataSourceName = "IPAPI";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}