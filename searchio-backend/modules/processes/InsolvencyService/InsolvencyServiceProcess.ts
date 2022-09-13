import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class InsolvencyServiceProcess extends Process {

    protected id = "InsolvencyService";                   
    protected source: DataSourceName = "Insolvency Service";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}