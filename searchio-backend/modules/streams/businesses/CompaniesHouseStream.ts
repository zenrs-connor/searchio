import { Stream } from "../Stream";

const request = require('request');
const COMPANIESHOUSE_API_KEY = '585a186b-ba2c-4978-be95-17e5ffbb773f';

export class CompaniesHouseStream extends Stream {

    constructor(query: string) {
        super(query);
        this.tags.push("companies-house");
        console.log(this.tags);
    }

    public async companyProfile(companyNumber: string) {
        let response;

        await new Promise((resolve) => {

            let options = {
                url: `https://api.company-information.service.gov.uk/company/${companyNumber}`,
                headers: {
                    'Host': 'api.company-information.service.gov.uk',
                    'Authorization': `Basic development@zenrs.com`
                },
                json: true
            };

            console.log("\n\n");
            console.log(options);

            request(options, async (err, res, body) => {

                console.log("\n\nRes:");
                console.log(res);
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

// Skeleton code, Companies House API issues stopped development. Will re-visit.