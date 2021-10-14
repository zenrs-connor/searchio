import { DataSourceName } from "../../types/DataSourceName";
import { SocketService } from "../SocketService";
import { ScraperStream } from "./ScraperStream";
import { DVLAVehicleCheck } from "../processes/DVLA/DVLAVehicleCheck";
import { Process } from "../processes/Process";


export class DVLAStream extends ScraperStream {

    protected id: DataSourceName = "DVLA";

    protected processes: Process[] = [
        new DVLAVehicleCheck(this.socket, this.query)
    ]

    constructor(query: string, socket: SocketService) {
        super(query, socket);
        this.tags.push("dvla");
    }
}