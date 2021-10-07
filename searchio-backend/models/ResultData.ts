import { DataSourceName } from "../types/DataSourceName";
import { ResultDataTypeName } from "../types/ResultDataTypeName";

export interface ResultData {

    //  DATABASE FIELDS  
    name: string;                    //  A name to describe the result - used when identifying duplicate results
    type: ResultDataTypeName;           //  The unique type of data that is contained by this Result e.g. "WebPage", "IPAddress"
    data: any;                      //  The actual result data

}