import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class GoogleProcess extends Process {

    protected id = "Google";                   
    protected source: DataSourceName = "Google";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}