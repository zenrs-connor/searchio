import { Stream } from "../Stream";


const request = require('request');
const IPSTACK_API_KEY = '5d0ca3e80d57375e563aabc72096a716';

export class IPStackStream extends Stream {
    constructor(query: string) {
        super(query);
        this.tags.push("ipstack");
        console.log(this.tags);
    }

    public async ipLookup(IP: string) {
        let response;

        await new Promise((resolve) => {

            let url = `http://api.ipstack.com/${IP}?access_key=${IPSTACK_API_KEY}&format=1`;
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