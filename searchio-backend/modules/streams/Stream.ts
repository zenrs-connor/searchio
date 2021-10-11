import { Credentials } from "../../models/Credentials";
import { PatternProcessPair } from "../../models/PatternProcessPair";
import { DataSourceName } from "../../types/DataSourceName";
import { StreamTag } from "../../types/StreamTag";
import { CredentialsService } from "../CredentialsService";
import { NumberFormats } from "../../models/NumberFormats";
import { SocketService } from "../SocketService";
import { ProcessCode, ProcessStatus, ProcessStatusCodeEnum } from "../../types/ProcessStatusCode";
import { SearchioResponse } from "../../models/SearchioResponse";
import { error, success } from "../ResponseHandler";
import { Process } from "../../models/Process";
import { ProcessResult } from "../../models/ProcessResult";


//   This class is the the superclass for all data streams used by Searchio.
export class Stream {

    protected id: DataSourceName = "Unnamed Source";                   //  Unique identifier used to tell data streams apart.
    protected query: string = '';                //  Empty string to hold the query term used while searching.
    protected credentials: Credentials;              //  Property to hold the current set of credentials that are being used by this Stream to make API calls.
    protected tags: StreamTag[] = [];               //  List of tags relevent to each data stream. Subclasses of this class will populate the list.
    protected processes: any = {};                   //  An object to hold the status of processes held by this stream
    protected socket: SocketService;

    /*

    A list of pattern/process function pairs to allow for multiple functionalitites from one stream.
    The following example shows how this should be used.

    protected patterns: PatternProcessPair[] = [
        { pattern: /^[a-z]+$/, query: this.lowercaseQuery },
        { pattern: /^[A-Z]+$/, query: this.uppercaseQuery },
        { pattern: /^[a-zA-Z]+$/, query: this.mixedcaseQuery },
        { pattern: /^[0-9]+$/, query: this.numberQuery },
        { pattern: /^[a-zA-Z0-9]+$/, query: this.anyQuery },
    ];

    */
    protected patterns: PatternProcessPair[] = [];    
    

    //  SERVICES
    protected _credentials: CredentialsService = new CredentialsService();

    constructor(query: string, socket: SocketService) {
        this.query = query;
        this.socket = socket;
    }

    /* GETTERS */
    public getId(): string { return this.id; }
    public getQuery(): string { return this.query; } 
    public getTags(): StreamTag[] { return this.tags; }
    public getProcesses(): Process[] { return this.processes; }

    public getPatterns(): PatternProcessPair[] { return this.patterns }

    //  Function to check if a given query string matches one of the patterns of this type of Stream
    //  Parameters:
    //  query: string       -   The query term to be checked
    public validQueries(query: string = this.query): Function[] {

        let match: any;     //  Variable to hold the result of each pattern match
        let valid = [];     //  Array of valid query functions

        //  Loop through each pattern of this Stream
        for(let pair of this.patterns) {

            console.log(pair);

            //  Check that the query matches the pattern
            match = query.match(pair.pattern);  

            //  If so, add the query function into the arr, binding this Stream object to ensure data is carried over
            if(match !== null) valid.push(pair.process.bind(this));

        }

        //  Return the list of valid functions
        return valid;
    }

    public async setProcessStatus(process: string, code: ProcessCode, message: string): Promise<SearchioResponse> {


        if(!this.processes[process]) return error(`(${this.id}) Unable to find process with name '${process}'`);

        this.processes[process].code = code;
        this.processes[process].message = message;
        this.processes[process].status = ProcessStatusCodeEnum[code] as ProcessStatus;

        this.socket.processUpdate(this.processes[process]);

        return success(`(${this.id}) Set status of process '${process}' to ${code} (${ProcessStatusCodeEnum[code]})`)

    };

    public start() {

        setTimeout(() => {

            let queries = this.validQueries();

            for(let q of queries) {
                q()
            }

        }, 1000)

        
    }

    protected success(message: string, data: any = undefined): SearchioResponse {
        return success(`(${this.id}) ${message}`, data);
    }

    protected error(message: string, data: any = undefined): SearchioResponse {
        return error(`(${this.id}) ${message}`, data);
    }

    //  Function to fetch a set of credentials to be used while making a query
    private async fetchCredentials() {
        this.credentials = await this._credentials.get(this.id);
    }


    public async reformat(business: string) {
        // Code to take in comapny name and get it into the format ready to be inserted into URL

        await new Promise((resolve) => {
           business = business.replace(/\s/g, "+");
           resolve(undefined)
        });
        return(business);
    }

    public async extractDomain(url: string) {
        // Mobile Phone Formats
        let domainPattern: RegExp = /^(?:.*:\/\/)?(?:www\.)?([^:\/]*).*$/;

        let domain;

        await new Promise((resolve) => {
            domain = url.match(domainPattern)[1];
            resolve(undefined);
        });
        return domain;
    }

    public async reformatNumber(number: string) {
        // CODE TO REFORMAT PHONE NUMBERS INTO POSSIBLE FORMATS (LOCAL AND INTERNATIONAL)
        
        // Mobile Phone Formats
        let mobileLocalPattern: RegExp = /^(07)[0-9]{9,9}$/;
        let mobileInternationalPattern: RegExp = /^(\+447)[0-9]{9,9}$/;

        // Landline Formats
        let landlineLocalPattern: RegExp = /^(0)[0-9]{10,10}$/;
        let landlineInternationalPattern: RegExp = /^(\+44)[0-9]{10,10}$/;

        const formatted: NumberFormats = { local: '', international: '' }

        await new Promise((resolve) => {
            //match regex with test
            if (mobileLocalPattern.test(number) == true) {
                formatted.local = number;

                let internationalFormat: string = "+44" + number.slice(1,);
                formatted.international = internationalFormat;

                resolve(undefined);

            } else if (mobileInternationalPattern.test(number) == true) {
                formatted.international = number;

                let localFormat: string = "0" + number.slice(3,);
                formatted.local = localFormat;

                resolve(undefined);

            } else if (landlineLocalPattern.test(number) == true) {
                formatted.local = number;

                let internationalFormat: string = "+44" + number.slice(1,);
                formatted.international = internationalFormat;

                resolve(undefined);

            } else if (landlineInternationalPattern.test(number) == true) {
                formatted.international = number;

                let localFormat: string = "0" + number.slice(3,);
                formatted.local = localFormat;

                resolve(undefined);

            } else {
                formatted.local = number;
                formatted.international = number;
                resolve(undefined);
            }
        });

        return formatted;
    }
}