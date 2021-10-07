import { PHONE_NUMBER } from "../../../assets/RegexPatterns";
import { PatternProcessPair } from "../../../models/PatternProcessPair";
import { ProcessResult } from "../../../models/ProcessResult";
import { ResultData } from "../../../models/ResultData";
import { SearchioResponse } from "../../../models/SearchioResponse";
import { DataSourceName } from "../../../types/DataSourceName";
import { ProcessCode, ProcessStatus, ProcessStatusCodeEnum } from "../../../types/ProcessStatusCode";
import { SocketService } from "../../SocketService";
import { Stream } from "../Stream";

import * as MD5 from "md5";

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

                const obj = JSON.parse(body);

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

            //  Build the array of Results from the response
            const data: ResultData[] = [
                { name: "Valid Number", type: "Boolean", data: response.valid },
                { name: "Number", type: "PhoneNumber", data: response.number },
                { name: "Local Format", type: "PhoneNumber", data: response.local_format },
                { name: "International Format", type: "PhoneNumber", data: response.international_format },
                { name: "Country Prefix", type: "Text", data: response.country_prefix },
                { name: "Country Code", type: "Text", data: response.country_code },
                { name: "Country Name", type: "Text", data: response.country_name },
                { name: "Location", type: "Text", data: response.location },
                { name: "Carrier", type: "Text", data: response.carrier },
                { name: "Line Type", type: "Text", data: response.line_type },
            ];

            //  Build the ProcessResult object
            const result: any = {
                source: this.id,
                process: PROCESS_NAME,
                data: data
            }
            
            result.hash = MD5(result);
            result.query = this.query;

            //  Update the process state to COMPLETED
            this.setProcessStatus(PROCESS_NAME, ProcessStatusCodeEnum.COMPLETED as ProcessCode, `Process Complete!`);

            //  Emit the result of this process
            this.socket.result(result as ProcessResult);

            //  Return a successful SearchioResponse attaching the result
            return this.success(`Validated phone number.`, result)

        } else {

            let message: string;

            switch(response.error.code) {

                case 104:
                    message = `API key rate limit exceeded.`;
                    break;
                default:
                    message = `Unknown error.`
            }


            //  Update the process state to ERROR
            this.setProcessStatus(PROCESS_NAME, ProcessStatusCodeEnum.ERROR as ProcessCode, message);
            //  Return an SearchioResponse error
            return this.error(message, response.error)
        }

    }
}