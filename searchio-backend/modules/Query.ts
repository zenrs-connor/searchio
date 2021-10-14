import { Stream } from "./streams/Stream";
import { QueryStatus } from "../models/QueryStatus";
import { QueryData } from "../models/QueryData";
import { SocketService } from "./SocketService";
import { QueryStatusCodeEnum } from "../types/QueryStatusCode";
import { Streams } from "../assets/Streams";
import { error, success } from "./ResponseHandler";
import { SearchioResponse } from "../models/SearchioResponse";
import { ResponseEmitter } from "./ResponseEmitter";
import { Process } from "./processes/Process";
import { PROCESSES } from "../assets/Processes";

export class Query {

    private query: string;
    private processes: Process[] = [];
    private socket: SocketService;
    private status: QueryStatus = {
        code: 1,
        message: "Query is inititated, awaiting start."
    };

    private results: any = {};

    constructor(query: string){
        this.query = query;
    }

    public async build(): Promise<SearchioResponse> {

        try {
            
            this.socket = new SocketService();
            let res = await this.socket.init();

            if(!res.success) return res;

            res = this.getValidProcesses();

            if(!res.success) return res;

            this.processes = res.data as Process[];
            return success(`(Query) Successfully built query "${this.query}"`)
        

        } catch(err) {
            return error(`(Query) Could not build query`, err);
        }
    }

    public getSocketID(): string {
        return this.socket.getID();
    }

    private getValidProcesses(query: string = this.query) {

        const processes: Process[] = []
        let p: Process;
        let match: any;

        try {

            for(let proto of PROCESSES) {
                p = new proto(this.socket, query);
                match = query.match(p.getPattern());
                if(match) {
                    processes.push(p);
                }
            }

            return success(`(Query) Got ${processes.length} valid process${ processes.length === 1 ? '' : 'es' }.`, processes);

        } catch(err) {
            return error(`(Query) Could not get valid processes.`)
        }



    }

    private getData() {
        // RETURNS DATA FROM A STREAM
    }

    public cache() {
        // CACHE
    }

    public updateStatus(){
        this.status
    }

    public getStatus() {
        return this.status;
    }

    public getProcesses() {
        return this.processes;
    }

    public start() {

        this.status = {
            code: QueryStatusCodeEnum.ACTIVE,
            message: "Query is active."
        }

        for(let process of this.processes) {
            process.execute();
        }

    }

    public stop(){

        this.status = {
            code: QueryStatusCodeEnum.STOPPED,
            message: "Query is stopped."
        }
        
    }

    public refresh() {
        // REFRESH THE QUERY
    }

    public kill() {
        // CANCEL/KILL THE QUERY
    }


    
}