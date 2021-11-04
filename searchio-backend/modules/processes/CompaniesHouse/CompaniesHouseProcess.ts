import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class CompaniesHouseProcess extends Process {

    protected id = "CompaniesHouse";                   
    protected source: DataSourceName = "Companies-House";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}