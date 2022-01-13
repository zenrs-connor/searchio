import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class EmploymentTribunalsProcess extends Process {

    protected id = "EmploymentTribunalsProcess";                   
    protected source: DataSourceName = "Employment Tribunals";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}