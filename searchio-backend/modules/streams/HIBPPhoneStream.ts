import { Stream } from "../Stream";

const request = require('request');
const HIBP_API_KEY = 'a3727b5d96f94cd4bcb190899befca19';


// COMPROMISED PHONE NUMBER FOR TESTING -> +491637496985

export class HIBPPhoneStream extends Stream {
    constructor(query: string) {
        super(query);
        this.tags.push("HaveIBeenPwned");
        console.log(this.tags);
    }

    public async breaches() {
        let response;
        await new Promise(resolve => {
            request('https://haveibeenpwned.com/api/v3/breaches', {json: true}, async (err, res, body) => {
                console.log(body);
                if(!err) {
                    response = body;
                    resolve(undefined);
                } else {
                    response = null;
                    resolve(undefined);
                }
            });
        });
        return response;
    }

    /*public async query(account: string) {
        let response;

        await new Promise((resolve) => {

            let options = {
                url: `https://haveibeenpwned.com/api/v3/breachedaccount/${account}`,
                headers: {
                    'User-Agent': 'request',
                    'hibp-api-key': HIBP_API_KEY
                },
                json: true
            };

            request(options, async (err, res, body) => {

                console.log(body);
                response = body;

                if(err) {
                    response = { success: false, error: err };
                }
                resolve(undefined);
            });
        });

        return response;
    }*/
}