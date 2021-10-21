import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class RapidCarCheckProcess extends Process {

    protected id = "RapidCarCheck";                   
    protected source: DataSourceName = "RapidCarCheck";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}