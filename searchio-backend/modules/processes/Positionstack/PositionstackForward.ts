import { ADDRESS, IPV4 } from "../../../assets/RegexPatterns";
import { ResultData } from "../../../models/ResultData";
import { SearchioResponse } from "../../../models/SearchioResponse";
import { DataSourceName } from "../../../types/DataSourceName";
import { SocketService } from "../../SocketService";
import { PositionstackProcess } from "./PositionstackProcess";

const request = require('request');

export class PositionstackForward extends PositionstackProcess {

    protected id = "Positionstack";                   
    protected source: DataSourceName = "Positionstack";   
    protected name: string = "Positionstack Forward Lookup"
    protected pattern: RegExp = ADDRESS;  

    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }

    //  Overwrite of the abstract function held in Process.ts
    //  This function is what is called when the Process executes
    //  It returns a SearchioResponse containing any success or error data
    protected async process(): Promise<SearchioResponse> {
        let result = await this.forward();
        return result;
    }

    //  Function to send a query to the positionstack API
    protected async forward(query: string = this.query): Promise<SearchioResponse> {

        let response;

        try {

            await new Promise((resolve) => {
                let url = `http://api.positionstack.com/v1/forward?access_key=${this.API_KEY}&query=${query}&limit=10&output=json`;
                request(url, async (err, res, body) => {
                    response = JSON.parse(body);
                    resolve(undefined);
                });
            });

            if(!response.data[0]) return this.success(`(Positionstack Forward) Could not find any locations matching query.`);
            let result = response.data[0];

            let results: ResultData[] = [
                { name: "Map", type: "Map", data: [result.latitude, result.longitude] },
                { name: "Coordinates", type: "Text", data: `${result.latitude}, ${result.longitude}` }
            ];

            if(result.postal_code) results.push({ name: "Postal Code", type: "Text", data: result.postal_code });
            if(result.type) results.push({ name: "Type", type: "Text", data: result.type });
            if(result.name) results.push({ name: "Name", type: "Text", data: result.name });
            if(result.number) results.push({ name: "Number", type: "Text", data: result.number });
            if(result.street) results.push({ name: "Street", type: "Text", data: result.street });
            if(result.confidence) results.push({ name: "Confidence", type: "Text", data: result.confidence });
            if(result.region) results.push({ name: "Region", type: "Text", data: result.region });
            if(result.region_code) results.push({ name: "Region Code", type: "Text", data: result.region_code });
            if(result.county) results.push({ name: "County", type: "Text", data: result.county });
            if(result.locality) results.push({ name: "Locality", type: "Text", data: result.locality });
            if(result.administrative_area) results.push({ name: "Administrative Area", type: "Text", data: result.administrative_area });
            if(result.neighbourhood) results.push({ name: "Neighbourhood", type: "Text", data: result.neighbourhood });
            if(result.country) results.push({ name: "Country", type: "Text", data: result.country });
            if(result.country_code) results.push({ name: "Country Code", type: "Text", data: result.country_code });
            if(result.continent) results.push({ name: "Continent", type: "Text", data: result.continent });
            if(result.label) results.push({ name: "Label", type: "Text", data: result.label });


            
            console.log(results);

            return this.success(`(PositionstackForward) Successfully performed forward geocoding.`, results);
        } catch (err) {
            return this.error(`(PositionstackForward) Could not perform forward geocoding.`, err);
        }
    }
}