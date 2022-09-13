import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class GoogleScholarProcess extends Process {

    protected id = "GoogleScholar";                   
    protected source: DataSourceName = "GoogleScholar";

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}