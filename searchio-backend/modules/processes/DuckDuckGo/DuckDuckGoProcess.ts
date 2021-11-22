import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class DuckDuckGoProcess extends Process {

    protected id = "DuckDuckGo";                   
    protected source: DataSourceName = "DuckDuckGo";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}