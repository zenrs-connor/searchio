import { PHONE_NUMBER } from "../../../assets/RegexPatterns";
import { PatternProcessPair } from "../../../models/PatternProcessPair";
import { Process } from "../../../models/Process";
import { SearchioResponse } from "../../../models/SearchioResponse";
import { DataSourceName } from "../../../types/DataSourceName";
import { ProcessCode, ProcessStatus, ProcessStatusCodeEnum } from "../../../types/ProcessStatusCode";
import { error, success } from "../../ResponseHandler";
import { SocketService } from "../../SocketService";
import { Stream } from "../Stream";

const request = require('request');
const NUMVERIFY_API_KEY = 'c69d685d3534f116078b3386efae3eee';

export class NumverifyStream extends Stream {

    protected id: DataSourceName = "Numverify";

    protected processes: any = {
        
        "validate number": { 
            source: this.id,
            query: this.query,
            name: "validate number", 
            code: ProcessStatusCodeEnum.DORMANT as ProcessCode, 
            status: "DORMANT" as ProcessStatus, 
            message: `Awaiting command...`
        }
    };

    protected patterns: PatternProcessPair[] = [
        { pattern: PHONE_NUMBER, process: this.validate.bind(this) }
    ]


    constructor(query: string, socket: SocketService) {
        super(query, socket);
        this.tags.push("numverify");
    }


    /*
    *
    *   PROCESSES
    * 
    *   This Stream has only one process: validate
    * 
    */

    //  Process to validate a phone number, yielding a valid status as well as additional information.
    public async validate(phoneNumber: string = this.query): Promise<SearchioResponse> {

        //  Set a name constant for this process
        const PROCESS_NAME = "validate number"

        //  Set status of this process to ACTIVE
        this.setProcessStatus(PROCESS_NAME, ProcessStatusCodeEnum.ACTIVE as ProcessCode, `Validating number ${phoneNumber}...`);

        
        //  As a "request" call is being made to an API, a Promise is needed rather than a simple "await"
        //  The result of the call is stored in  a constant
        const response: any = await new Promise((resolve) => {

            //  Build the API query url using an API keyu and the provided phone number
            let url = `http://apilayer.net/api/validate?access_key=${NUMVERIFY_API_KEY}&number=${phoneNumber}&country_code=GB&format=1`;

            //  Make the request to the API
            request(url, async (err, res, body) => {
            
                //  Check if there is an error, and if so resolve the promise passing it through
                if(err) {
                    resolve({ error: err });
                } else {
                    //  If no error has occurred, resolve the body of the response
                    resolve(body);
                }
            });
        });


        //  Check that no error has occurred
        if(!response.error) {
            
            //  Update the process state to COMPLETED
            this.setProcessStatus(PROCESS_NAME, ProcessStatusCodeEnum.COMPLETED as ProcessCode, `Process Complete!`);
            //  Return a successful SearchioResponse
            return this.success(`Validated phone number.`)

        } else {
            
            //  Update the process state to ERROR
            this.setProcessStatus(PROCESS_NAME, ProcessStatusCodeEnum.ERROR as ProcessCode, `Error!`);
            //  Return an SearchioResponse error
            return this.error(`Could not validate phone number.`, response.err)
        }

    }
}