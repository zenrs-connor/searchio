import { Query } from "./Query";

export class QueryController {
    // THIS FUNCTION WOULD BE CALLED TO MANAGE THE QUERY QUEUE
    
    private queries: Query[];

    constructor() {
        this.queries = [] // THIS IS AN ARRAY OF OBJECTS (THE OBJECT BEING THE QUERY)
    }
    
    public add(query) {
        this.queries.push(query);
        // QUERY OBJECT WOULD LOOK LIKE 
        //     const query = {UID: "", platforms: [], results:[]}
    }

    protected kill(uid) {
        // SORT THROUGH CURRENT QUERIES BEING ACTIONED AND FIND ONE THAT MATCHES THE UID, THEN CANCEL AND REMOVE IT
    }

    public get(uid) {
        // SORT THROUGH CURRENT QUERIES BEING ACTIONED AND FIND ONE THAT MATCHES THE UID, THEN RETURN THE CURRENT STATE OF THE QUERY OBJECT
    }
}