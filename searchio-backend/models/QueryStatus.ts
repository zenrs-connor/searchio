import { QueryStatusCode } from "../types/QueryStatusCode";

export interface QueryStatus {
    code: QueryStatusCode;
    message: string;
}