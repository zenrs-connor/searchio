import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class HunterProcess extends Process {

    protected id = "Hunter";                   
    protected source: DataSourceName = "Hunter";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}