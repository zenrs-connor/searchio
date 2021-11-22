//import {  } from "../../../assets/RegexPatterns";
import { IPV4 } from "../../../assets/RegexPatterns";
import { ResultData } from "../../../models/ResultData";
import { SearchioResponse } from "../../../models/SearchioResponse";
import { SocketService } from "../../SocketService";
import { IPStackProcess } from "./IPStackProcess";

const request = require('request');
const IPSTACK_API_KEY = '5d0ca3e80d57375e563aabc72096a716';

export class IPStackSearch extends IPStackProcess {
    
    protected id = "IPStackSearch";           
    protected name: "IP Search";
    protected pattern: RegExp = IPV4;
    
    //  Process extends the ResponseEmitter class, so be sure to include an argument for the socket
    //  Processes also take a query on creation
    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }

    //  Overwrite of the abstract function held in Process.ts
    //  This function is what is called when the Process executes
    //  It returns a SearchioResponse containing any success or error data
    protected async process(): Promise<SearchioResponse> {
        let result = await this.ipLookup();
        return result;
    }

    
    // Returns information associated with an IP address
    public async ipLookup(IP: string = this.query) {
        
        let response;
        
        try{

            await new Promise((resolve) => {

                let url = `http://api.ipstack.com/${IP}?access_key=${IPSTACK_API_KEY}&format=1`;

                request(url, async (err, res, body) => {

                    response = JSON.parse(body);

                    resolve(undefined);
                });
            });

            let results: ResultData[] = [
                { name: "Type", type: "Text", data: response.type },
                { name: "Continent", type: "Text", data: response.continent_name },
                { name: "Country", type: "Text", data: response.country_name },
                { name: "Region", type: "Text", data: response.region_name },
                { name: "City", type: "Text", data: response.city },
                { name: "Postcode", type: "Text", data: response.zip },
                { name: "Location", type: "WebLink", data: { text: "Google Maps", url: `https://www.google.com/maps/@${response.latitude},${response.longitude},10.5z` } }
            ];

            return this.success(`(IPStackSearch) Successfully performed ip lookup`, results);

        } catch(err) {
            return this.error(`(IPStackSearch) Could not perform ip lookup`, err);
        }
    }
}