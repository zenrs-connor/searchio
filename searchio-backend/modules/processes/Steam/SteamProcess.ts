import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class SteamProcess extends Process {

    protected id = "Steam";                   
    protected source: DataSourceName = "Steam";

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}