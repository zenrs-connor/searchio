import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class RoyalMailProcess extends Process {

    protected id = "RoyalMail";                   
    protected source: DataSourceName = "RoyalMail";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}