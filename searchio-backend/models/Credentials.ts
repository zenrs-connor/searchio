import { DataSourceName } from "../types/DataSourceName";

export interface Credentials {
    source: DataSourceName;
    data: any;
    last_used: Date;
    resting: Date;
}