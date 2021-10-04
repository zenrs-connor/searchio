import { Stream } from "./streams/Stream";
import { QueryStatus } from "../models/QueryStatus";
import { QueryData } from "../models/QueryData";
import { SocketService } from "./SocketService";
import { QueryStatusCodeEnum } from "../types/QueryStatusCode";
import { Streams } from "../assets/Streams";
import { error, success } from "./ResponseHandler";

export class Query {

    private query: string;
    private streams: Stream[] = [];
    private socket: SocketService = new SocketService();
    private status: QueryStatus = {
        code: 1,
        message: "Query is inititated, awaiting start."
    };


    constructor(query: string){
        this.query = query;
        let res = this.getValidStreams();
        if(res.success) this.streams = res.data as Stream[];
    }


    private getValidStreams(query: string = this.query) {
        let s: Stream;
        
        let streams: Stream[] = [];

        try {
            for(let proto of Streams) {
                s = new proto(query, this.socket);
                if(s.validQueries().length > 0) {
                    streams.push(s);
                }
            }

            return success(`Got ${streams.length} valid data stream${ streams.length === 1 ? '' : 's' }.`, streams);

        } catch(err) {
            return error(`Could not get valid streams.`)
        }

    }

    private getData() {
        // RETURNS DATA FROM A STREAM
    }

    public cache() {
        // CACHE
    }

    public build(data: QueryData) {
        // TAKE DATA AND PUT INTO QueryData INTERFACE
    }

    public updateStatus(){
        this.status
    }

    public getStatus() {
        return this.status;
    }

    public getStreams() {
        return this.streams;
    }

    public start() {

        this.status = {
            code: QueryStatusCodeEnum.ACTIVE,
            message: "Query is active."
        }

        for(let stream of this.streams) {
            console.log(stream)
            stream.start();
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