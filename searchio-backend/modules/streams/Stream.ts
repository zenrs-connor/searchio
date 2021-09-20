import { CredentialsResult } from "../../models/CredentialsResult";
import { StreamTag } from "../../types/StreamTag";


export class Stream {

    protected UID: string;
    protected queryStr: string;
    protected credentials: CredentialsResult;
    protected tags: StreamTag[] = [];

    constructor() {

    }

    public isValid() {
        // CHECK THE QUERY IS VALID
    }

    public getCredentials() {
        // RETRIEVE CREDENTIALS FOR THE RELEVANT DATA STREAMS
    }
}