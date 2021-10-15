import { EMAIL_ADDRESS, IPV4 } from "../../../assets/RegexPatterns";
import { SearchioResponse } from "../../../models/SearchioResponse";
import { SocketService } from "../../SocketService";
import { IPAPIProcess } from "./IPAPIProcess";

const request = require('request');
const IPAPI_API_KEY = 'f40bb00b0f85d2e92481db53e622eb05';

export class IPAPISearch extends IPAPIProcess {

    protected id = "IPAPISearch";           
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
        this.initWebdriver();
        let result = await this.ipLookup();
        this.destroyWebdriver();
        return result;
    }

    public async ipLookup(IP: string = this.query): Promise<SearchioResponse> {
        let response;
        try {
            await new Promise((resolve) => {

                let url = `http://api.ipstack.com/${IP}?access_key=${IPAPI_API_KEY}&format=1`;
                console.log(url);
                request(url, async (err, res, body) => {

                    response = body;

                    resolve(undefined);
                });
            });

            return this.success(`(IPAPISearch) Successfully performed ip lookup`, response);

        } catch(err) {
            return this.error(`(IPAPISearch) Could not perform ip lookup`, err);
        }
    }
}