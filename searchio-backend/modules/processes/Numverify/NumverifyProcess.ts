import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";


export class NumverifyProcess extends Process {

    protected id: string = "NumverifyProcess"
    protected source: DataSourceName = "Numverify";

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }

}