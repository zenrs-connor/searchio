import { EMAIL_ADDRESS } from "../../../assets/RegexPatterns";
import { ResultData } from "../../../models/ResultData";
import { SearchioResponse } from "../../../models/SearchioResponse";
import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";
import { HaveIBeenPwnedProcess } from "./HaveIBeenPwnedProcess";
const request = require('request');

/*
    This class serves as an example of what needs to be done to create a new Process
    Each process performs only one function, which should be contained in process() 
*/


const HIBP_API_KEY = 'a3727b5d96f94cd4bcb190899befca19';


//  Process to query the HIBP API and retrieve breaches
export class HaveIBeenPwnedBreaches extends HaveIBeenPwnedProcess {


    protected id = "HIBPBreaches";                   //  The ID of a Process should be the same as the class name
    protected name: "Breaches";                         //  Provide a user-readble name for this process.
    protected pattern: RegExp = EMAIL_ADDRESS;                   //  Assign a valid regex pattern to match against potential queries

    //  Process extends the ResponseEmitter class, so bve sure to include an argument for the socket
    //  Processes also take a query on creation
    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }

    //  Overwrite of the abstract function held in Process.ts
    //  This function is what is called when the Process executes and it should return a searchio response containing any results
    protected async process(): Promise<SearchioResponse> {

        //  Remember to use proper error handling
        try {

            this.setStatus("ACTIVE", `Querying breaches...`);

            let breaches = await this.breaches();

            if(!breaches.success) {
                return breaches;
            }

            let accountBreached = await this.accountBreaches(this.query);

            if(!accountBreached.success) {
                return accountBreached;
            }

            const results: ResultData[] = [];

            const table = {

                columns: [
                    { title: "Logo", key: "logo", type: "Image" },
                    { title: "Title", key: "title", type: "Text" },
                    { title: "Date", key: "date", type: "Date" },
                    { title: "Data Types", key: "data", type: "Text" },
                    { title: "No. Pwned", key: "count", type: "Number" },
                    { title: "Description", key: "description", type: "Html", width: '500px' }
                ],
                rows: []
            }


            let b;
            for(let breach of accountBreached.data) {

                b = breaches.data[breach.Name];

                let dataTypes = "";
                for(let type of b.DataClasses) {
                    dataTypes += `${type}, `;
                }
                if(dataTypes !== "") {
                    dataTypes = dataTypes.substr(0, dataTypes.length - 2);
                }

                table.rows.push({
                    logo: b.LogoPath,
                    title: b.Title,
                    date: b.BreachDate,
                    data: dataTypes,
                    count: b.PwnCount,
                    description: b.Description
                });

            }




            let result: ResultData = {
                name: `Account Breaches For ${ this.query } (HaveIBeenPwned)`,
                type: "Table",
                data: table
            }

            return this.success(`Successfully got breaches for term '${this.query}'`, [result]);
    

        } catch(err) {

            this.setStatus("ERROR");

            //  In the event of a non-SearchioResponse error, format its contents and retrun a this.error
            return this.error("Unknown Error!", err)
        }

    }


    /*
    
    ADDITIONAL FUNCTIONS 
    
    */

    public async breaches(): Promise<SearchioResponse> {
        

        try {

            let response: any = await new Promise(resolve => {
            
                request('https://haveibeenpwned.com/api/v3/breaches', {json: true}, async (err, res, body) => {
    
                    if(!err) {
                        resolve({ success: true, data: body });
                    } else {;
                        resolve({ success: false, data: err });
                    }
                });
            });
    
            if(response.success) {

                //  Convert the breaches into an indexed object format
                const obj: any = {};
                for(let breach of response.data) {
                    obj[breach.Name] = breach;
                }

                return this.success(`Successfully got HaveIBeenPwned breach list!`, obj);
            } else {
                return this.error(`Could not get HaveIBeenPwned breach list.`, response.data)
            }

        } catch(err) {
            return this.error(`Uncaught error while getting breaches`, err);
        }

        

    }

    public async accountBreaches(query: string = this.query): Promise<SearchioResponse> {

        try {

            let response: any = await new Promise(resolve => {
            
                const options = {
                    url: `https://haveibeenpwned.com/api/v3/breachedaccount/${query}`,
                    headers: {
                        'User-Agent': 'request',
                        'hibp-api-key': HIBP_API_KEY
                    },
                    json: true
                }


                request(options, async (err, res, body) => {
                    if(!err) {
                        resolve({ success: true, data: body });
                    } else {;
                        resolve({ success: false, data: err });
                    }
                });
            });
    
            if(response.success) {
                return this.success(`Successfully got HaveIBeenPwned account breaches list!`, response.data);
            } else {
                return this.error(`Could not get HaveIBeenPwned account breaches list.`, response.data)
            }

        } catch(err) {
            return this.error(`Uncaught error while getting account breaches.`, err);
        }
        


    }

    public async accountPastes(query: string = this.query): Promise<SearchioResponse> {

        try {

            let response: any = await new Promise(resolve => {
            
                const options = {
                    url: `https://haveibeenpwned.com/api/v3/pasteaccount/${query}`,
                    headers: {
                        'User-Agent': 'request',
                        'hibp-api-key': HIBP_API_KEY
                    },
                    json: true
                }


                request(options, async (err, res, body) => {
                    if(!err) {
                        resolve({ success: true, data: body });
                    } else {;
                        resolve({ success: false, data: err });
                    }
                });
            });
    
            if(response.success) {
                return this.success(`Successfully got HaveIBeenPwned account pastes!`, response.data);
            } else {
                return this.error(`Could not get HaveIBeenPwned account pastes.`, response.data)
            }

        } catch(err) {
            return this.error(`Uncaught error while getting account pastes.`, err);
        }
        


    }

}