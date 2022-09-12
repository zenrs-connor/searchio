import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class EtherscanProcess extends Process {

    protected id = "EtherscanProcess";                   
    protected source: DataSourceName = "Etherscan";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}