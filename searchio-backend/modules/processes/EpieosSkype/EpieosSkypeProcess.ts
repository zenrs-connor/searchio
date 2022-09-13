import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class EpieosSkypeProcess extends Process {

    protected id = "EpieosSkypeProcess";                   
    protected source: DataSourceName = "Epieos Skype";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}