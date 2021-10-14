import { DataSourceName } from "../types/DataSourceName";
import { ProcessCode, ProcessStatus } from "../types/ProcessStatusCode";

export interface ProcessData {
    query: string;                      //  Query that the process is acting upon
    source: DataSourceName;             //  Source that this process is called from
    name: string;                      //  The name of the process - should be all lowercase with words separated by spaced
    status: ProcessStatus;                     //  Status code - for reference check the StreamStatusCode.ts type
    code: ProcessCode;                    //  Status code - for reference check the StreamStatusCode.ts type
    message: string;                    //  A message to describe the current status of this process
}


