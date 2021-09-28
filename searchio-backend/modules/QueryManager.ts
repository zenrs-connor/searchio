import { SearchioResponse } from "../models/SearchioResponse";
import { Query } from "./Query";
import { error, success } from "./ResponseHandler";

export class QueryManager {
    
    private queries: any = {}

    constructor() {}
    
    public async add(query: string): Promise<SearchioResponse> {
        try {
            if(!this.queries[query]) {
                this.queries[query] = new Query(query);
                return success(`(QueryManager) Added query "${query}".`)
            } else {
                return error(`(QuerManager) Query "${query}" already exists.`)
            }
        } catch(err) {
            return error(`(QueryManager) Could not add query "${query}".`, err);
        }
    }

    protected async kill(query: string): Promise<SearchioResponse> {
        try {
            delete this.queries[query];
            return success(`(QueryManager) Killed query "${query}".`);
        } catch(err) {
            return error(`(QueryManager) Could not kill query "${query}"`, err);
        }
    }


    public async get(query: string): Promise<SearchioResponse> {
        try {

            if(this.queries[query]) {
                return success(`(QueryManager) Got query "${query}".`)
            } else {
                return error(`(QueryManager) Query "${query}" does not exist.`)
            }

        } catch(err) {
            return error(`(QueryManager) Could not get query "${query}".`, err);
        }
    }
}