import { Stream } from "../Stream";

const request = require('request');
const HUNTER_API_KEY = '2b3a66d5cde5e4501930c2b989c84f6ce162e1b0';

export class HunterStream extends Stream {
    constructor(query: string) {
        super(query);
        this.tags.push("hunter");
        console.log(this.tags);
    }

    public async emailFinder(firstName: string, lastName: string, domain: string) {
        let response;

        await new Promise((resolve) => {

            let url = `https://api.hunter.io/v2/email-finder?domain=${domain}&first_name=${firstName}&last_name=${lastName}&api_key=${HUNTER_API_KEY}`;
            request(url, async (err, res, body) => {

                console.log(body);
                response = body;

                if(err) {
                    response = { success: false, error: err };
                }
                resolve(undefined);
            });
        });

        return response;
    }
}