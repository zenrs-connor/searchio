import { DataSourceName } from "../types/DataSourceName";
import { ResultTypeName } from "../types/ResultTypeName";

export interface Result {
    
    //  DATABASE FIELDS
    hash: string;                   //  Unique identifier generated from the hash of this object  
    type: ResultTypeName;           //  The unique type of data that is contained by this Result e.g. "WebPage", "IPAddress"
    source: DataSourceName;         //  The the source of this result e.g. "CreditSafe", "Google", "CompaniesHouse"
    data: string;                   //  Compressed data object of this result stored in the DB, also used as a hash when identifying duplicate results.
    updated: Date;

    //  IN-CLIENT FIELDS
    decompressed?: any;             //  The actual data of this result which is decompressed upon arriving in the client
    html?: string;                  //  A HTML formetted representation of the data for use in the client, generated upon arriving in the client
}