import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class eToolsProcess extends Process {

    protected id = "eToolsProcess";                   
    protected source: DataSourceName = "eTools";

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}