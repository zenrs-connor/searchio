import { DataSourceName } from "../types/DataSourceName";

export interface DataSource {
    id: DataSourceName;
    description: string;
}