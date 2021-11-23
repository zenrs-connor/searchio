import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class GigablastProcess extends Process {

    protected id = "Gigablast";                   
    protected source: DataSourceName = "Gigablast";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}