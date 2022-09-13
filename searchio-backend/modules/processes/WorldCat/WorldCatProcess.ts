import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class WorldCatProcess extends Process {

    protected id = "WorldCat";                   
    protected source: DataSourceName = "WorldCat";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}