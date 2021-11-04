import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class MailBoxLayerProcess extends Process {

    protected id = "MailBoxLayer";                   
    protected source: DataSourceName = "MailBoxLayer";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}