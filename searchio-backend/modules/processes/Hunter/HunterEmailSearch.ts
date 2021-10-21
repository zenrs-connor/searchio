import { EMAIL_ADDRESS } from "../../../assets/RegexPatterns";
import { SearchioResponse } from "../../../models/SearchioResponse";
import { HunterProcess } from "./HunterProcess";
import { SocketService } from "../../SocketService";

const request = require('request');
const HUNTER_API_KEY = '2b3a66d5cde5e4501930c2b989c84f6ce162e1b0';

export class HunterEmailSearch extends HunterProcess {
    
    
    protected id = "HunterEmailSearch";           
    protected name: "Email Check";
    protected pattern: RegExp = EMAIL_ADDRESS;
    
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
        let result = await this.emailFinder();
        this.destroyWebdriver();
        return result;
    }


    // Returns a possible email for a domain when given a first and last name
    public async emailFinder(firstName: string, lastName: string, domain: string) {
        let response;
        try{

    
            await new Promise((resolve) => {

                let url = `https://api.hunter.io/v2/email-finder?domain=${domain}&first_name=${firstName}&last_name=${lastName}&api_key=${HUNTER_API_KEY}`;
                request(url, async (err, res, body) => {

                    console.log(body);
                    response = body;

                    if(err) {
                        response = { success: false, error: err };
                    }
                    resolve(undefined);
                });
            });

            return this.success(`(HunterEmailSearch) Successfully performed email search`, response);

        } catch(err) {
            return this.error(`(HunterEmailSearch) Could not perform email search`, err);
        }

    }
}