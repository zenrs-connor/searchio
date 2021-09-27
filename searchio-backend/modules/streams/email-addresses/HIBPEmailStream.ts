import { EmailAddressStream } from "./EmailAddressStream";

const request = require('request');
const HIBP_API_KEY = 'a3727b5d96f94cd4bcb190899befca19';

export class HIBPEmailStream extends EmailAddressStream {
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

    public async query(account: string) {
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
    }

    public async pastesForAccount(account: string) {
        let response;
    
        await new Promise(resolve => {
            const options = {
                url: `https://haveibeenpwned.com/api/v3/pasteaccount/${account}`,
                headers: {
                    'User-Agent': 'request',
                    'hibp-api-key': HIBP_API_KEY
                },
                json: true
            };
    
            request(options, (err, res, body) => {
                
                if(err) {
                    response = { success: false, error: err };
                } else {
    
                    body = body ? body : [];
    
                    let arr = [];
                    let d;
    
                    for(let paste of body) {
    
                        let name = paste.Source;
                        let description = `ID: ${paste.Id}<br>`;
    
                        if(paste.Title) {
                            description += `Title: ${paste.Title}<br>`
                        }
    
                        arr.push({
                            name: name,
                            description: description,
                            date: paste.Date ? paste.Date : null,
                            pwn_count: paste.EmailCount
                        });
    
                    }
                    console.log(arr);
                    response = { success: true, data: arr };
                }
                resolve(undefined);
            });
        });
    
        return response;
    }
}