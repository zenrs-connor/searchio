import { Credentials } from "../../models/Credentials";
import { PatternQueryPair } from "../../models/PatternQueryPair";
import { StreamStatus } from "../../models/StreamStatus";
import { DataSourceName } from "../../types/DataSourceName";
import { StreamTag } from "../../types/StreamTag";
import { CredentialsService } from "../CredentialsService";



//   This class is the the superclass for all data streams used by Searchio.
export class Stream {

    protected id: DataSourceName;                   //  Unique identifier used to tell data streams apart.
    protected query: string = '';                //  Empty string to hold the query term used while searching.
    protected credentials: Credentials;              //  Property to hold the current set of credentials that are being used by this Stream to make API calls.
    protected tags: StreamTag[] = [];               //  List of tags relevent to each data stream. Subclasses of this class will populate the list.
    


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
    

    protected status: StreamStatus;                 //  An object holding the current state of this Stream object

    //  SERVICES
    protected _credentials: CredentialsService = new CredentialsService();

    constructor(query: string) {
        this.query = query;
    }

    /* GETTERS */
    public getId(): string { return this.id; }
    public getQuery(): string { return this.query; } 
    public getTags(): StreamTag[] { return this.tags; }
    public getStatus(): StreamStatus { return this.status; }

    //  Function to check if a given query string matches one of the patterns of this type of Stream
    //  Parameters:
    //  query: string       -   The query term to be checked
    public validQueries(query: string = this.query): Function[] {

        let match: any;     //  Variable to hold the result of each pattern match
        let valid = [];     //  Array of valid query functions

        //  Loop through each pattern of this Stream
        for(let pair of this.patterns) {

            //  Check that the query matches the pattern
            match = query.match(pair.pattern);  

            //  If so, add the query function into the arr, binding this Stream object to ensure data is carried over
            if(match !== null) valid.push(pair.query.bind(this));

        }

        //  Return the list of valid functions
        return valid;
    }

    //  Function to fetch a set of credentials to be used while making a query
    private async fetchCredentials() {
        this.credentials = await this._credentials.get(this.id);
    }
}