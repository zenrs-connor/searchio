import { DataSourceName } from "../types/DataSourceName";
import { ResultData } from "./ResultData";

export interface ProcessResult {
    source: DataSourceName;             //  The Data Souce that has yielded this result
    process: string;                    //  The process that has yielded this result
    process_id: string;
    data: ResultData[];                  //  List of data results from this process
    query: string;                  //  The query that has yielded this result
    hash: string;                       //  Md5 has of the results array
}