import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class LiveuamapProcess extends Process {

    protected id = "Liveuamap";
    protected source: DataSourceName = "Liveuamap";

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}