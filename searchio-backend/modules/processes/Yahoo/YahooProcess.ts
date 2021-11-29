import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class YahooProcess extends Process {

    protected id = "Yahoo";                   
    protected source: DataSourceName = "Yahoo";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}