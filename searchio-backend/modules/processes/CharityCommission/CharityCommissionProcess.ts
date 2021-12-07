import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class CharityCommissionProcess extends Process {

    protected id = "CharityCommissionProcess";                   
    protected source: DataSourceName = "Charity Commission";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}