import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class LegacyProcess extends Process {

    protected id = "Legacy";
    protected source: DataSourceName = "Legacy";

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}