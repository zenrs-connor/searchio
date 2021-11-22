import { ProcessResult } from "../models/ProcessResult";
import { SearchioResponse } from "../models/SearchioResponse";
import { error, success } from './ResponseHandler';
import { compress, decompress } from "./Compression";

const { Pool } = require('pg');

export const DB = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'searchio',
    password: 'CrackedOrchestra',
    port: 5433
});




export class StorageService {

    private connected: boolean = false;

    constructor() {

        this.testConnection();

    }

    public async testConnection(): Promise<SearchioResponse> {

        const q = {
            text: "SELECT reltuples AS estimate FROM pg_class WHERE relname = 'results'",
            values: []
        }

        try {
            let res = await DB.query(q);
            this.connected = true;
            return success(`(StorageService) Successfully tested DB connection`);
        } catch(err) {
            return error(`(StrorageService) Error while testing DB`, err)
        }
    }

    public async cache(result: ProcessResult): Promise<SearchioResponse> {

        const q = {
            text: `INSERT INTO results (query, source, process_id, process, data) 
                    VALUES ($1, $2, $3, $4, $5) ON CONFLICT ON CONSTRAINT results_pkey DO UPDATE SET updated = CURRENT_TIMESTAMP, data = EXCLUDED.data;`,
            values: [result.query, result.source, result.process_id, result.process, compress(result.data)]
        }

        try {

            let res = await DB.query(q);
            return success(`(StorageService) Successfully cached a result!`);

        } catch (err) {
            return error(`(StorageService) Uncaught error while caching result`, err);
        }

    }

    public async get(query: string) {

        const q = {
            text: "SELECT * FROM results WHERE query = $1 ORDER BY source, process_id",
            values: [query]
        }

        try {
            
            let res = await DB.query(q);
            let results = res.rows.map((x) => {
                return { ...x, data: decompress(x.data) }
            });
            return success(`(StorageService) Successfully got stored results for query '${query}'`, results);

        } catch(err) {
            return error(`(StorageService) Uncaught error while getting stored results`, err);
        }

    }

}