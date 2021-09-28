import { Stream } from "../Stream";

const request = require('request');
const MAILBOXLAYER_API_KEY = 'a04c099a43d25b33ddbee8409c0244bd';

export class MailBoxLayerStream extends Stream {
    constructor(query: string) {
        super(query);
        this.tags.push("mail-box-layer");
        console.log(this.tags);
    }

    public async validateEmail(email: string) {
        let response;

        await new Promise((resolve) => {

            let url = `http://apilayer.net/api/check?access_key=${MAILBOXLAYER_API_KEY}&email=${email}&smtp=1&format=1`;
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