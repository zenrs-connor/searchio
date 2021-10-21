import { DOMAIN, EMAIL_ADDRESS } from "../../../assets/RegexPatterns";
import { SearchioResponse } from "../../../models/SearchioResponse";
import { HunterProcess } from "./HunterProcess";
import { SocketService } from "../../SocketService";

const request = require('request');
const HUNTER_API_KEY = '2b3a66d5cde5e4501930c2b989c84f6ce162e1b0';

export class HunterDomainSearch extends HunterProcess {
    
    
    protected id = "HunterDomainSearch";           
    protected name: "Domain Check";
    protected pattern: RegExp = DOMAIN;
    
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
        let result = await this.domainSearch();
        this.destroyWebdriver();
        return result;
    }


    // Returns a list of emails associated with a domain
    public async domainSearch(domain: string = this.query) {
        let response;
        
        try{

            await new Promise((resolve) => {

    
                let urlAPI = `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${HUNTER_API_KEY}`;
                console.log(urlAPI);
                request(urlAPI, async (err, res, body) => {

                    response = body;

                    if(err) {
                        response = { success: false, error: err };
                    }
                    resolve(undefined);
                });
            });

            return this.success(`(HunterDomainSearch) Successfully performed domain search`, response);

        } catch(err) {
            return this.error(`(HunterDomainSearch) Could not perform domain search`, err);
        }
    }
}