import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class LawPagesProcess extends Process {

    protected id = "LawPages";                   
    protected source: DataSourceName = "LawPages";
    
    public credentials = {login: 'CarlForth', password: 'Carl123Forth'};

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}