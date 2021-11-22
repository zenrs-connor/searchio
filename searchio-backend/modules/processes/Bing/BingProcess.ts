import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class BingProcess extends Process {

    protected id = "Bing";                   
    protected source: DataSourceName = "Bing";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}