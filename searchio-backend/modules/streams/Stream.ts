import { Credentials } from "../../models/Credentials";
import { PatternQueryPair } from "../../models/PatternQueryPair";
import { StreamStatus } from "../../models/StreamStatus";
import { DataSourceName } from "../../types/DataSourceName";
import { StreamTag } from "../../types/StreamTag";
import { CredentialsService } from "../CredentialsService";
import { NumberFormats } from "../../models/NumberFormats";
import { SocketService } from "../SocketService";


//   This class is the the superclass for all data streams used by Searchio.
export class Stream {

    protected id: DataSourceName;                   //  Unique identifier used to tell data streams apart.
    protected query: string = '';                //  Empty string to hold the query term used while searching.
    protected credentials: Credentials;              //  Property to hold the current set of credentials that are being used by this Stream to make API calls.
    protected tags: StreamTag[] = [];               //  List of tags relevent to each data stream. Subclasses of this class will populate the list.
    protected statuses: any = {};                   //  An object to hold the progress status of different queries
    protected socket: SocketService;

    /*

    A list of pattern/query function pairs to allow for multiple functionalitites from one stream.
    The following example shows how this should be used.

    protected patterns: PatternQueryPair[] = [
        { pattern: /^[a-z]+$/, query: this.lowercaseQuery },
        { pattern: /^[A-Z]+$/, query: this.uppercaseQuery },
        { pattern: /^[a-zA-Z]+$/, query: this.mixedcaseQuery },
        { pattern: /^[0-9]+$/, query: this.numberQuery },
        { pattern: /^[a-zA-Z0-9]+$/, query: this.anyQuery },
    ];

    */
    protected patterns: PatternQueryPair[] = [];    
    

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
    public getStatuses(): StreamStatus { return this.statuses; }

    public getPatterns(): PatternQueryPair[] { return this.patterns }

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
            if(match !== null) valid.push(pair.query.bind(this));

        }

        //  Return the list of valid functions
        return valid;
    }

    public sendUpdate() {
        this.socket.update(this.id, this.statuses);
    }

    public start() {

        let queries = this.validQueries();

        console.log("STARTING TO COLLECT");

        for(let q of queries) {
            q()
        }
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
        console.log(business);
        return(business);
    }

    public async extractDomain(url: string) {
        // Mobile Phone Formats
        let domainPattern: RegExp = /^(?:.*:\/\/)?(?:www\.)?([^:\/]*).*$/;

        let domain;

        await new Promise((resolve) => {
            domain = url.match(domainPattern)[1];
            console.log("DOMAIN EXTRACTED: " + domain);
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