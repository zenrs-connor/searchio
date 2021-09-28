import { PHONE_NUMBER } from "../../../assets/RegexPatterns";
import { PatternQueryPair } from "../../../models/PatternQueryPair";
import { DataSourceName } from "../../../types/DataSourceName";
import { StreamStatusCodeEnum } from "../../../types/StreamStatusCode";
import { SocketService } from "../../SocketService";
import { Stream } from "../Stream";

const request = require('request');
const NUMVERIFY_API_KEY = 'c69d685d3534f116078b3386efae3eee';

export class NumverifyStream extends Stream {

    protected id: DataSourceName = "Numverify";

    protected statuses: any = {
        validate: { code: StreamStatusCodeEnum.DORMANT, message: `Awaiting command...`}
    }

    protected patterns: PatternQueryPair[] = [
        { pattern: PHONE_NUMBER, query: this.validate.bind(this) }
    ]


    constructor(query: string, socket: SocketService) {
        super(query, socket);
        this.tags.push("numverify");
    }




    public async validate(phoneNumber: string = this.query) {

        this.statuses.validate = {
            code: StreamStatusCodeEnum.ACTIVE,
            message: `(Numverify) Validating number...`
        }

        this.sendUpdate();

        let response;

        await new Promise((resolve) => {

            let url = `http://apilayer.net/api/validate?access_key=${NUMVERIFY_API_KEY}&number=${phoneNumber}&country_code=GB&format=1`;
            request(url, async (err, res, body) => {
                response = body;
                if(err) {
                    response = { success: false, error: err };
                }
                resolve(undefined);
            });
        });


        this.statuses.validate = {
            code: StreamStatusCodeEnum.DORMANT,
            message: `(Numverify) Awaiting command...`
        }

        this.sendUpdate();

        return response;
    }
}