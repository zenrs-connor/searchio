import { Credentials } from "../models/Credentials";
import { DataSourceName } from "../types/DataSourceName";

export class CredentialsService {
    
    constructor() {};

    public async get(source: DataSourceName): Promise<Credentials | undefined> {
        return;
    }

}