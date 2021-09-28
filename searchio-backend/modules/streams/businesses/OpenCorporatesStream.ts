import { Stream } from "../Stream";


const request = require('request');
const OPENCORPORATES_API_KEY = '';

export class OpenCorporatesStream extends Stream {
    constructor(query: string) {
        super(query);
        this.tags.push("open-corporates");
        console.log(this.tags);
    }

    public async companyNameSearch(companyName: string) {
        let response;

        await new Promise((resolve) => {

            this.reformat(companyName).then(companyName => {
                let url = `https://api.opencorporates.com/v0.4/companies/search?q=${companyName}`;

                request(url, async (err, res, body) => {

                    console.log(JSON.parse(body).results.companies[0]);
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

    public async companyNumberSearch(countryCode: string, companyNumber: string) {
        let response;

        await new Promise((resolve) => {

            let url = `https://api.opencorporates.com/v0.4/companies/gb/${companyNumber}`;

            request(url, async (err, res, body) => {

                console.log(JSON.parse(body).results.company);
                response = body;

                if(err) {
                    response = { success: false, error: err };
                }
                resolve(undefined);
            });
        });

        return response;
    }

    public async officerSearch(name: string) {
        let response;

        await new Promise((resolve) => {

            this.reformat(name).then(name => {
                let url = `https://api.opencorporates.com/v0.4/officers/search?q=${name}`;

                request(url, async (err, res, body) => {

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