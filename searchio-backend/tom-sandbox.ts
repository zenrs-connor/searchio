import { Stream } from "./modules/streams/Stream";
import { CompaniesHouseStream } from "./modules/streams/CompaniesHouseStream";
import { HIBPEmail } from "./modules/processes/HIBP/HIBPEmail";
import { HIBPPhone } from "./modules/processes/HIBP/HIBPPhone";
import { HunterDomainSearch } from "./modules/processes/Hunter/HunterDomainSearch";
import { HunterEmailSearch } from "./modules/processes/Hunter/HunterEmailSearch";
import { IPAPISearch } from "./modules/processes/IPAPI/IPAPISearch";
import { MailBoxLayerSearch } from "./modules/processes/MailBoxLayer/MailBoxLayerSearch";


export class tomSandbox extends Stream {

    constructor() {
        super('',undefined);
    };

    public async run() {
        let x = new MailBoxLayerSearch(undefined, "");
        let y = await x.validateEmail("PhillipsEJ1@cardiff.ac.uk");
        console.log(y);
    }

}