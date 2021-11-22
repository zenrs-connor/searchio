import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class StreetCheckProcess extends Process {

    protected id = "StreetCheck";                   
    protected source: DataSourceName = "StreetCheck";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}