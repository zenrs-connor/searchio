import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class URLScanProcess extends Process {

    protected id = "URLScan";                   
    protected source: DataSourceName = "URL Scan";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}