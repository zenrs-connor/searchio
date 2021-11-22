import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class OpenGazettesProcess extends Process {

    protected id = "OpenGazettes";                   
    protected source: DataSourceName = "OpenGazettes";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}