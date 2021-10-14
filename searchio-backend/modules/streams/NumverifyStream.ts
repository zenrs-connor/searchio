import { PHONE_NUMBER } from "../../assets/RegexPatterns";
import { PatternProcessPair } from "../../models/PatternProcessPair";
import { ProcessResult } from "../../models/ProcessResult";
import { ResultData } from "../../models/ResultData";
import { SearchioResponse } from "../../models/SearchioResponse";
import { DataSourceName } from "../../types/DataSourceName";
import { ProcessCode, ProcessStatus, ProcessStatusCodeEnum } from "../../types/ProcessStatusCode";
import { SocketService } from "../SocketService";
import { Stream } from "./Stream";

import * as MD5 from "md5";
import { NumverifyValidate } from "../processes/Numverify/NumverifyValidate";
import { Process } from "../processes/Process";

const request = require('request');
const NUMVERIFY_API_KEY = 'c69d685d3534f116078b3386efae3eee';

export class NumverifyStream extends Stream {

    protected id: DataSourceName = "Numverify";

    protected processes: Process[] = [
        new NumverifyValidate(this.socket, this.query)
    ]

    constructor(query: string, socket: SocketService) {
        super(query, socket);
        this.tags.push("numverify");
    }
}