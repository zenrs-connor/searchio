import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class PSNProfilesProcess extends Process {

    protected id = "PSNProfiles";                   
    protected source: DataSourceName = "PSN Profiles";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}