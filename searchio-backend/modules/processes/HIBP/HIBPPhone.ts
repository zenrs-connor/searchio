import { EMAIL_ADDRESS, PHONE_NUMBER } from "../../../assets/RegexPatterns";
import { HIBPProcess } from "./HIBPProcess";
import { SocketService } from "../../SocketService";
import { SearchioResponse } from "../../../models/SearchioResponse";

const request = require('request');
const HIBP_API_KEY = 'a3727b5d96f94cd4bcb190899befca19';

export class HIBPPhone extends HIBPProcess {

    protected id = "HIBPPhone";           
    protected name: "HIBP Phone";
    protected pattern: RegExp = PHONE_NUMBER;

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
        let result = await this.pastesForAccount();
        this.destroyWebdriver();
        return result;
    }


    // Returns a list of all breaches recorded
    public async breaches() {
        let response;
        try {

            await new Promise(resolve => {
                request('https://haveibeenpwned.com/api/v3/breaches', {json: true}, async (err, res, body) => {
                    console.log(body);
                    if(!err) {
                        response = body;
                        resolve(undefined);
                    } else {
                        response = null;
                        resolve(undefined);
                    }
                });
            });

            return this.success(`(HIBP) Successfully retrieved breaches`, response);

        } catch(err) {
            return this.error(`(HIBP) Error retrieving breaches`, err);
        }
        
    }

    // Returns a list of all breaches a phone number was involved in
    public async pastesForAccount(account: string = this.query) {
        let response;

        try {

            await new Promise(resolve => {
                const options = {
                    url: `https://haveibeenpwned.com/api/v3/pasteaccount/${account}`,
                    headers: {
                        'User-Agent': 'request',
                        'hibp-api-key': HIBP_API_KEY
                    },
                    json: true
                };
        
                request(options, (err, res, body) => {
                    
                    if(err) {
                        response = { success: false, error: err };
                    } else {
        
                        body = body ? body : [];
        
                        let arr = [];
                        let d;
        
                        for(let paste of body) {
        
                            let name = paste.Source;
                            let description = `ID: ${paste.Id}<br>`;
        
                            if(paste.Title) {
                                description += `Title: ${paste.Title}<br>`
                            }
        
                            arr.push({
                                name: name,
                                description: description,
                                date: paste.Date ? paste.Date : null,
                                pwn_count: paste.EmailCount
                            });
        
                        }
                        console.log(arr);
                        response = { success: true, data: arr };
                    }
                    resolve(undefined);
                });
            });

            return this.success(`(HIBP) Successfully retrieved pastes for account`, response);

        } catch(err) {
            return this.error(`(HIBP) Error retrieving pastes for account`, err);
        }
    
    }
}