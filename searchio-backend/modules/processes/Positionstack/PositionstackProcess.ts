import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class PositionstackProcess extends Process {

    protected id = "Positionstack";                   
    protected source: DataSourceName = "Positionstack";     
    protected API_KEY = "210ddd190a5a28bd7cf7cfc0a7a31f15";

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}