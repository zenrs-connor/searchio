import { Stream } from "./streams/Stream";
import { QueryStatus } from "../models/QueryStatus";
import { QueryData } from "../models/QueryData";
import { SocketService } from "./SocketService";
import { QueryStatusCodeEnum } from "../types/QueryStatusCode";

export class Query {

    private query: string;
    private streams: Stream[];
    private socket: SocketService = new SocketService();
    private status: QueryStatus = {
        code: 1,
        message: "Query is inititated, awaiting start."
    };


    constructor(query: string){
        console.log("CONSTRUCTING NEW QUERY", query);
        this.query = query;
    }


    private getValidStreams(query: string) {
        // GET STREAMS THAT ARE VALID?
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