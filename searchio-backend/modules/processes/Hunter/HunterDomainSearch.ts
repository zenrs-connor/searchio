import { DOMAIN, EMAIL_ADDRESS } from "../../../assets/RegexPatterns";
import { SearchioResponse } from "../../../models/SearchioResponse";
import { HunterProcess } from "./HunterProcess";
import { SocketService } from "../../SocketService";
import { ResultData } from "../../../models/ResultData";

const request = require('request');
const HUNTER_API_KEY = '2b3a66d5cde5e4501930c2b989c84f6ce162e1b0';
//const HUNTER_API_KEY = ' ';

export class HunterDomainSearch extends HunterProcess {
    
    
    protected id = "HunterDomainSearch";           
    protected name: string = "Domain Check";
    protected pattern: RegExp = DOMAIN;
    
    //  Process extends the ResponseEmitter class, so be sure to include an argument for the socket
    //  Processes also take a query on creation
    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }


    //  Overwrite of the abstract function held in Process.ts
    //  This function is what is called when the Process executes
    //  It returns a SearchioResponse containing any success or error data
    // Returns a list of emails associated with a domain
    protected async process(domain: string = this.query) {

        try{
            const response: any = await new Promise((resolve) => {

                let urlAPI = `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${HUNTER_API_KEY}`;
 
                request(urlAPI, async (err, res, body) => {

                    const obj = JSON.parse(body);

                    //  Check if there is an error, and if so resolve the promise passing it through
                    if(obj.errors) {
                        resolve({ error: obj.errors });
                    } else {
                        //  If no error has occurred, resolve the body of the response
                        resolve(obj);
                    }
                    
                });
            });

            //  Check that no error has occurred
            if(!response.error) {

                const table = {

                    columns: [
                        { title: "Email", key: "email", type: "Text" },
                        { title: "Type", key: "type", type: "Text", width: '100px' },
                        /*{ title: "Confidence Score", key: "score", type: "Number" },*/
                        { title: "First Name", key: "firstName", type: "Text" },
                        { title: "Last Name", key: "lastName", type: "Text" },
                        /*{ title: "Position", key: "position", type: "Text" },
                        { title: "Seniority", key: "seniority", type: "Text" },
                        { title: "Department", key: "department", type: "Text" },*/
                        /*{ title: "LinkedIn", key: "linkedin", type: "Text" },
                        { title: "Twitter", key: "twitter", type: "Text" },*/
                        { title: "Phone Number", key: "phoneNumber", type: "Text" },
                        { title: "Verified", key: "verifiedDate", type: "Text", width: '100px' },
                        { title: "Status", key: "status", type: "Text", width: '100px' },
                        { title: "Sources", key: "sources", type: "Text" }
                    ],
                    rows: []
                }
    
                for(let email of response.data.emails) {
    
    
                    table.rows.push({
                        email: email.value,
                        type: email.type,
                        score: email.confidence,
                        firstName: email.first_name,
                        lastName: email.last_name,
                        position: email.position,
                        seniority: email.seniority,
                        department: email.department,
                        linkedin: email.linkedin,
                        twitter: email.twitter,
                        phoneNumber: email.phone_number,
                        verifiedDate: email.verification.date,
                        status: email.verification.status,
                        sources: email.sources[0].uri
                    });
    
                }

                console.log(response.data);

                //  Build the array of Results from the response
                const data: ResultData[] = [
                    { name: "Domain", type: "Text", data: response.data.domain },


                    //  I have ommitted some of this data because it does not seem entirely relevant
                    //  We can always re-implement it if needed in future

                    /*{ name: "Disposable", type: "Boolean", data: response.data.disposable },
                    { name: "Webmail", type: "Boolean", data: response.data.webmail },
                    { name: "Accepts All", type: "Boolean", data: response.data.accept_all },
                    { name: "Pattern", type: "Text", data: response.data.pattern },*/


                    { name: "Organisation", type: "Text", data: response.data.organization },
                    { name: "Country", type: "Text", data: response.data.country },
                    { name: "State", type: "Text", data: response.data.state },
                    { name: "Emails", type: "Table", data: table }
                ];

                //  Return a successful SearchioResponse attaching the result
                return this.success(`Performed domain search.`, data)

            } else {

                let message: string;

                switch(response.error[0].code) {

                    case 104:
                        message = `API key rate limit exceeded.`;
                        break;
                    case 401:
                        message = `API key invalid.`;
                        break;
                    default:
                        message = `Unknown error.`
                }

                
                //  Return an SearchioResponse error
                return this.error(message, response.error)
            }

        } catch(err) {
            return this.error(`(HunterDomainSearch) Could not perform domain search`, err);
        }
    }
}