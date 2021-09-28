import { PhoneNumberStream } from "./PhoneNumberStream";

const request = require('request');
const NUMVERIFY_API_KEY = 'c69d685d3534f116078b3386efae3eee';


export class NumverifyStream extends PhoneNumberStream {
    constructor(query: string) {
        super(query);
        this.tags.push("numverify");
        console.log(this.tags);
    }

    public async numverifyValidation(phoneNumber: string) {
        let response;

        await new Promise((resolve) => {

            let url = `http://apilayer.net/api/validate?access_key=${NUMVERIFY_API_KEY}&number=${phoneNumber}&country_code=GB&format=1`;
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