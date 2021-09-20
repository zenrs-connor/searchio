import { CredentialsResult } from "../../models/CredentialsResult";
import { StreamStatus } from "../../models/StreamStatus";
import { StreamTag } from "../../types/StreamTag";

//   This class is the the superclass for all data streams used by Searchio.
export class Stream {

    protected UID: string = 'stream';               //  Unique identifier used to tell data streams apart.
    protected queryStr: string = '';                //  Empty string to hold the query term used while searching.
    protected credentials: CredentialsResult;       //  Property to hold the current set of credentials that are being used by this Stream to make API calls.
    protected tags: StreamTag[] = [];               //  List of tags relevent to each data stream. Subclasses of this class will populate the list.
    protected pattern: RegExp = /^$/;               //  A Regex pattern used to determine if a query term is appropriate for this data stream.
    protected status: StreamStatus;                 //  An object holding the current state of this Stream object

    constructor(query: string) {

    }

    /* GETTERS */
    public getUID(): string { return this.UID; }
    public getQuery(): string { return this.queryStr; } 
    public getTags(): StreamTag[] { return this.tags; }
    public getStatus(): StreamStatus { return this.status; }

    //  Function to check if a given query string matches the pattern of this type of Stream
    //  Parameters:
    //  query: string       -   The query term to be checked
    public isValid(query: string): boolean {
        const match = query.match(this.pattern);
        return match !== undefined;
    }

    private fetchCredentials() {
        // RETRIEVE CREDENTIALS FOR THE RELEVANT DATA STREAMS
    }
}