import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";

export class BlogSearchEngineProcess extends Process {

    protected id = "BlogSearchEngine";                   
    protected source: DataSourceName = "BlogSearchEngine";     

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }
}