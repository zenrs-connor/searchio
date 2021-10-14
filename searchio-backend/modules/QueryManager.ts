import { SearchioResponse } from "../models/SearchioResponse";
import { Query } from "./Query";
import { error, success } from "./ResponseHandler";

/*
*   This class is in controll of adding, transporting, and killing active Queries. 
*   It functions as the intermediary between the client side and the backend, most of it's functionality being called from the API.
*
*/

export class QueryManager {
    
    //  Object to hold all ativew queries managed by this QueryManager instance.
    //  The key of each object is the query term
    private queries: any = {}

    constructor() {}
    
    //  Function to add a new Query to the manager.
    //  Returns the ID of the newly created Socket
    public async add(query: string): Promise<SearchioResponse> {
        try {

            //  Check if there is no exiting query that fits the query term
            if(!this.queries[query]) {

                //  Start a new Query instance
                let q = new Query(query);

                //  Attempt to build the query
                let res = await q.build();
                if(!res.success) return res;

                //  Start the data collection process of the Query

                setTimeout(() => {
                    q.start();
                }, 1000);

                //  Add the query to the index of active queries
                this.queries[query] = q;

                return success(`(QueryManager) Added query "${query}".`, { socket: this.queries[query].getSocketID() })
            

            } else {
                return success(`(QuerManager) Query "${query}" already exists.`, { socket: this.queries[query].getSocketID() })
            }
        } catch(err) {
            return error(`(QueryManager) Could not add query "${query}".`, err);
        }
    }

    //  Function to get the socket ID of an existing Query
    public async get(query: string): Promise<SearchioResponse> {
        try {
            if(this.queries[query]) {
                return success(`(QueryManager) Got query "${query}".`, { socket: this.queries[query].getSocketID() })
            } else {
                return error(`(QueryManager) Query "${query}" does not exist.`)
            }
        } catch(err) {
            return error(`(QueryManager) Could not get query "${query}".`, err);
        }
    }


    public async kill(query: string): Promise<SearchioResponse> {
        try {

            if(this.queries[query]) {
                delete this.queries[query];
                return success(`(QueryManager) Killed query "${query}".`);
            } else {
                return error(`(QueryManager) Query "${query}" does not currently exist.`)
            }

        } catch(err) {
            return error(`(QueryManager) Could not kill query "${query}"`, err);
        }
    }
}