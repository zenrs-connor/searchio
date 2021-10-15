import { EMAIL_ADDRESS } from "../../../assets/RegexPatterns";
import { SearchioResponse } from "../../../models/SearchioResponse";
import { SocketService } from "../../SocketService";
import { MailBoxLayerProcess } from "./MailBoxLayerProcess";


const request = require('request');
const MAILBOXLAYER_API_KEY = 'a04c099a43d25b33ddbee8409c0244bd';

export class MailBoxLayerSearch extends MailBoxLayerProcess {


    protected id = "MailBoxLayerSearch";           
    protected name: "Email Address Search";
    protected pattern: RegExp = EMAIL_ADDRESS;


    //  Process extends the ResponseEmitter class, so be sure to include an argument for the socket
    //  Processes also take a query on creation
    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }



    public async validateEmail(email: string): Promise<SearchioResponse> {
        let response;
        try {

            await new Promise((resolve) => {

                let url = `http://apilayer.net/api/check?access_key=${MAILBOXLAYER_API_KEY}&email=${email}&smtp=1&format=1`;
                console.log(url);
                request(url, async (err, res, body) => {

                    response = body;
                    resolve(undefined);
                });
            });

            return this.success(`(MailBoxLayerSearch) Successfully performed email validation`, response);

        } catch(err) {
            return this.error(`(MailBoxLayerSearch) Could not perform email validation`, err);
        }
        
    }
}