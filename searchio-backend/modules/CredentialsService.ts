import { CredentialsResult } from "../models/CredentialsResult";
import { CredentialsPlatform } from "../types/CredentialsPlatform";

export class CredentialsService {
    
    constructor() {};

    public async get(platform: CredentialsPlatform): Promise<CredentialsResult | undefined> {
        return;
    }

}