import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class HaveIBeenPwnedProcess extends Process {

    protected id = "HaveIBeenPwnedProcess";                   
    protected source: DataSourceName = "HaveIBeenPwned";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}