import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class PhoneInfogaProcess extends Process {

    protected id = "PhoneInfoga";                   
    protected source: DataSourceName = "PhoneInfoga";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}