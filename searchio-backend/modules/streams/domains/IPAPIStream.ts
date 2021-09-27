import { DomainStream } from "./DomainStream";

const request = require('request');
const IPAPI_API_KEY = 'f40bb00b0f85d2e92481db53e622eb05';

export class IPAPIStream extends DomainStream {
    constructor(query: string) {
        super(query);
        this.tags.push("ipapi");
        console.log(this.tags);
    }

    public async ipLookup(IP: string) {
        let response;

        await new Promise((resolve) => {

            let url = `http://api.ipstack.com/${IP}?access_key=${IPAPI_API_KEY}&format=1`;
            console.log(url);
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