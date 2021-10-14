import { ResultData } from "../../../models/ResultData";
import { SearchioResponse } from "../../../models/SearchioResponse";
import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { Process } from "../Process";
import * as MD5 from "md5";
import { ProcessResult } from "../../../models/ProcessResult";
import { PHONE_NUMBER } from "../../../assets/RegexPatterns";
import { NumverifyProcess } from "./NumverifyProcess";

const request = require('request');
const NUMVERIFY_API_KEY = 'c69d685d3534f116078b3386efae3eee';


export class NumverifyValidate extends NumverifyProcess {

    protected id = "NumverifyValidate";
    protected name: "Validate Number";
    protected pattern: RegExp = PHONE_NUMBER;

    constructor(socket: SocketService, query: string) {
        super(socket, query)
    }

    protected async process(): Promise<SearchioResponse> {

        //  Set status of this process to ACTIVE
        this.setStatus("ACTIVE", `Validating number ${this.query}...`);

        //  As a "request" call is being made to an API, a Promise is needed rather than a simple "await"
        //  The result of the call is stored in  a constant
        const response: any = await new Promise((resolve) => {

            //  Build the API query url using an API keyu and the provided phone number
            let url = `http://apilayer.net/api/validate?access_key=${NUMVERIFY_API_KEY}&number=${this.query}&country_code=GB&format=1`;

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

            //  Return a successful SearchioResponse attaching the result
            return this.success(`Validated phone number.`, data)

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
            this.setStatus("ERROR", message);
            
            //  Return an SearchioResponse error
            return this.error(message, response.error)
        }



    }

}