import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class BlockchainProcess extends Process {

    protected id = "BlockchainProcess";                   
    protected source: DataSourceName = "Blockchain";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}