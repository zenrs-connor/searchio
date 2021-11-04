import { BUSINESS } from "../../../assets/RegexPatterns";
import { SearchioResponse } from "../../../models/SearchioResponse";
import { HMLandRegistryProcess } from "./HMLandRegistryProcess";
import { SocketService } from "../../SocketService";

const request = require('request');
const HMLAND_KEY = '43a3e1a5-3f25-4a8b-b374-7c8b213912e2';
//const HMLAND_KEY = '';

export class HMLandRegistryDomestic extends HMLandRegistryProcess {
    
    
    protected id = "HMLandRegistryDomestic";           
    protected name: "UK companies that own property in England and Wales";
    protected pattern: RegExp = BUSINESS;
    
    //  Process extends the ResponseEmitter class, so be sure to include an argument for the socket
    //  Processes also take a query on creation
    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }


    //  Overwrite of the abstract function held in Process.ts
    //  This function is what is called when the Process executes
    //  It returns a SearchioResponse containing any success or error data
    public async process(): Promise<SearchioResponse> {
        let response;
        try{

            await new Promise((resolve) => {

                const options = {
                    url: `https://use-land-property-data.service.gov.uk/api/v1/datasets/history/ccod/CCOD_FULL_2020_09.zip`,
                    headers: {
                        'User-Agent': 'request',
                        'Authorization': HMLAND_KEY
                    },
                    json: true
                }

                request(options, async (err, res, body) => {

                    const obj = JSON.parse(JSON.stringify(body));

                    response = obj;

                    //  Check if there is an error, and if so resolve the promise passing it through
                    if(obj.error) {
                        resolve({ error: obj.error });
                    } else {
                        //  If no error has occurred, resolve the body of the response
                        resolve(obj);
                    }
                });
            });

            //  Check that no error has occurred
            if(!response.error) {

                //  Return a successful SearchioResponse attaching the result
                return this.success(`Successfully performed a search for data on UK companies that own property in England and Wales.`, response);

            } else {

                let message: string = response.error;
                
                //  Return an SearchioResponse error
                return this.error(message, response.error)
            }

        } catch(err) {
            return this.error(`(HMLandRegistryDomestic) Could not perform search for UK companies that own property in England and Wales`, err);
        }
    }
}