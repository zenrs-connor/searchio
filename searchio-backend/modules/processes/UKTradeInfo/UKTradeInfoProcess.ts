import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class UKTradeInfoProcess extends Process {

    protected id = "UKTradeInfo";                   
    protected source: DataSourceName = "UK Trade Info";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}