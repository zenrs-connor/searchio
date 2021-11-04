import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class IPStackProcess extends Process {

    protected id = "IPStack";                   
    protected source: DataSourceName = "IPStack";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}