import { QueryStatusCode } from "../types/QueryStatusCode";

export interface QueryStatus {
    code: QueryStatusCode;
    status: QueryStatusCode;
    message: string;
    query: string;
    
}