
import { QueryStatus } from "../models/QueryStatus";
import { SocketService } from "./SocketService";
import { QueryStatusCode, QueryStatusCodeEnum } from "../types/QueryStatusCode";
import { error, success } from "./ResponseHandler";
import { SearchioResponse } from "../models/SearchioResponse";
import { Process } from "./processes/Process";
import { PROCESSES } from "../assets/Processes";
import { StorageService } from "./StorageService";
import { ProcessResult } from "../models/ProcessResult";

export class Query {

    private query: string;
    private processes: Process[] = [];
    private socket: SocketService;
    private storage: StorageService = new StorageService();
    private cached: ProcessResult[] = [];

    private status: QueryStatus;

    private results: any = {};

    constructor(query: string){
        this.query = query;
        this.setStatus("DORMANT", `Query is awaiting command...`);
    }

    public getCache(): ProcessResult[] {
        return this.cached;
    }

    public async build(): Promise<SearchioResponse> {

        try {
            
            this.socket = new SocketService();
            let res = await this.socket.init();

            if(!res.success) return res;

            res = this.getValidProcesses();

            let cached = await this.storage.get(this.query);

            if(cached.success) {
                this.cached = cached.data;
            }

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

    public updateStatus(){
        this.status
    }

    public getStatus() {
        return this.status;
    }

    public getProcesses() {
        return this.processes;
    }

    private setStatus(code: QueryStatusCode, message: string) {

        this.status = {
            query: this.query,
            code: typeof code === 'number' ? code : QueryStatusCodeEnum[code],
            status: typeof code === 'string' ? code : QueryStatusCodeEnum[code],
            message: message
        }

        if(this.socket) this.socket.queryUpdate(this.status);

    }

    public detectCompletedLoop() {

        const interval = setInterval(() => {
        
            for(let process of this.processes) {
                if(process.getData().status !== "COMPLETED") return;
            }
            this.setStatus("COMPLETED", `Query has finished collection...`);
            clearInterval(interval);

        }, 1000);
    }

    public start() {
        
        this.setStatus("ACTIVE", `Query is active`);

        for(let process of this.processes) {
            process.execute();
        }

        this.detectCompletedLoop();

    }

    public stop(){
        
        /*this.status = {
            code: QueryStatusCodeEnum.STOPPED,
            message: "Query is stopped."
        }*/

    }



    public refresh() {
        // REFRESH THE QUERY
    }

    public kill() {
        // CANCEL/KILL THE QUERY
    }


    
}