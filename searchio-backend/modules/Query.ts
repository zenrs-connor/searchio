import { Stream } from "./streams/Stream";
import { QueryStatus } from "../models/QueryStatus";
import { QueryData } from "../models/QueryData";

export class Query {
    private UID: string;
    private name: string;
    private streams: Stream[];
    private socket: any;
    private status: QueryStatus;


    constructor(UID: string, name: string, streams: Stream[], socket: any, status: QueryStatus){
        this.UID = UID;
        this.name = name;
        this.streams = streams;
        this.socket = socket;
        this.status = status;
    }

    public getName() {
        return this.name;
    }

    public getUID() {
        return this.UID;
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
        // START THE QUERY
    }

    public stop(){
        // STOP THE QUERY
    }

    public refresh() {
        // REFRESH THE QUERY
    }

    public kill() {
        // CANCEL/KILL THE QUERY
    }


    
}