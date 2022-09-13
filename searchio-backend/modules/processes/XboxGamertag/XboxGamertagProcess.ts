import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class XboxGamertagProcess extends Process {

    protected id = "XboxGamertag";                   
    protected source: DataSourceName = "Xbox Gamertag";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}