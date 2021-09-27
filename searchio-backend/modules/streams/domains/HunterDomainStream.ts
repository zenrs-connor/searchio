import { DomainStream } from "./DomainStream";

const request = require('request');
const HUNTER_API_KEY = '2b3a66d5cde5e4501930c2b989c84f6ce162e1b0';

export class HunterDomainStream extends DomainStream {

    constructor(query: string) { 
        super(query); 
        this.tags.push("hunter");
        console.log(this.tags);
    }

    public async domainSearch(url: string) {
        let response;

        await new Promise((resolve) => {

            this.extractDomain(url).then(domain => {

                let urlAPI = `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${HUNTER_API_KEY}`;
                console.log(urlAPI);
                request(urlAPI, async (err, res, body) => {

                    console.log(body);
                    response = body;

                    if(err) {
                        response = { success: false, error: err };
                    }
                    resolve(undefined);
                });
            });
        });

        return response;
    }
}