import { Stream } from "./modules/streams/Stream";
import { CompaniesHouseStream } from "./modules/streams/CompaniesHouseStream";


export class tomSandbox extends Stream {

    constructor() {
        super('',undefined);
    };

    public async run() {
        let x = new CompaniesHouseStream('', undefined);
        x.nameSearch('Elliott Phillips');
    }

}