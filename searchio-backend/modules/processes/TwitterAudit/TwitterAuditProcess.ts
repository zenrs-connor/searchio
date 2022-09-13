import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class TwitterAuditProcess extends Process {

    protected id = "TwitterAudit";                   
    protected source: DataSourceName = "Twitter Audit";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}