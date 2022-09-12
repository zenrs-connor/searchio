import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class GoogleTranslateProcess extends Process {

    protected id = "Google Translate";                   
    protected source: DataSourceName = "Google Translate";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}