import { CompaniesHouseStream } from "./modules/streams/CompaniesHouseStream";


export class tomSandbox {

    constructor() {

    };

    public async run() {
        let x = new CompaniesHouseStream('');
        x.nameSearch();
    }

}