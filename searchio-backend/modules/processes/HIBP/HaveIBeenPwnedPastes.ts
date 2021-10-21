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
export class HaveIBeenPwnedPastes extends HaveIBeenPwnedProcess {


    protected id = "HIBPBreaches";                   //  The ID of a Process should be the same as the class name
    protected name: "Pastes";                         //  Provide a user-readble name for this process.
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

            this.setStatus("ACTIVE", `Querying pastes...`);

            let pastes = await this.accountPastes();

            if(!pastes.success) {
                return pastes;
            }

            const table = {

                columns: [
                    { title: "ID", key: "id", type: "Text" },
                    { title: "Title", key: "title", type: "Text" },
                    { title: "Date", key: "date", type: "Date" },
                    { title: "Email Count", key: "emails", type: "Number" },
                ],
                rows: []
            }


            for(let paste of pastes.data) {
                table.rows.push({
                    id: paste.Id,
                    source: paste.Source,
                    title: paste.Title ? paste.title : "No title",
                    date: paste.Date,
                    emails: paste.EmailCount
                });
            }

            let result: ResultData = {
                name: `Pastes For ${ this.query }`,
                type: "Table",
                data: table
            }

            return this.success(`Successfully got pastes for term '${this.query}'`, [result]);
    

        } catch(err) {

            this.setStatus("ERROR");

            //  In the event of a non-SearchioResponse error, format its contents and retrun a this.error
            return this.error("Unknown Error!", err)
        }

    }


    /*
    
    ADDITIONAL FUNCTIONS 
    
    */

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