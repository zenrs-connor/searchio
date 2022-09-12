import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class CheckUsernamesProcess extends Process {

    protected id = "CheckUsernames";                   
    protected source: DataSourceName = "CheckUsernames";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}