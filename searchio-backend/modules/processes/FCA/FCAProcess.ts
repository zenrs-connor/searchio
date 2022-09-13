import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class FCAProcess extends Process {

    protected id = "FCA";                   
    protected source: DataSourceName = "FCA";

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}