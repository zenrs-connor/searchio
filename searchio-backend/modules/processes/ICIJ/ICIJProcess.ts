import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class ICIJProcess extends Process {

    protected id = "ICIJ";                   
    protected source: DataSourceName = "ICIJ";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}