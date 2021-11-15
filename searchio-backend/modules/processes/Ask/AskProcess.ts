import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class AskProcess extends Process {

    protected id = "Ask";                   
    protected source: DataSourceName = "Ask";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}