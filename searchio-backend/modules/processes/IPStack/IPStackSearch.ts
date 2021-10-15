//import {  } from "../../../assets/RegexPatterns";
import { IPV4 } from "../../../assets/RegexPatterns";
import { SearchioResponse } from "../../../models/SearchioResponse";
import { SocketService } from "../../SocketService";
import { IPStackProcess } from "./IPStackProcess";

const request = require('request');
const IPSTACK_API_KEY = '5d0ca3e80d57375e563aabc72096a716';

export class IPStackSearch extends IPStackProcess {
    
    protected id = "IPStackSearch";           
    protected name: "IP Search";
    protected pattern: RegExp = IPV4;
    
    //  Process extends the ResponseEmitter class, so be sure to include an argument for the socket
    //  Processes also take a query on creation
    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }

    //  Overwrite of the abstract function held in Process.ts
    //  This function is what is called when the Process executes
    //  It returns a SearchioResponse containing any success or error data
    protected async process(): Promise<SearchioResponse> {
        this.initWebdriver();
        let result = await this.ipLookup();
        this.destroyWebdriver();
        return result;
    }

    
    public async ipLookup(IP: string = this.query) {
        
        let response;
        
        try{

            await new Promise((resolve) => {

                let url = `http://api.ipstack.com/${IP}?access_key=${IPSTACK_API_KEY}&format=1`;
                console.log(url);
                request(url, async (err, res, body) => {

                    console.log(body);

                    resolve(undefined);
                });
            });

            return this.success(`(IPStackSearch) Successfully performed ip lookup`, response);

        } catch(err) {
            return this.error(`(IPStackSearch) Could not perform ip lookup`, err);
        }
    }
}