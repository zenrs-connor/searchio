import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class BizNarProcess extends Process {

    protected id = "BizNar";                   
    protected source: DataSourceName = "BizNar";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}