import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class HMLandRegistryProcess extends Process {

    protected id = "HMLandRegistry";                   
    protected source: DataSourceName = "HM Land Registry";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}