import { Stream } from "./modules/streams/Stream";
import { CompaniesHouseStream } from "./modules/streams/CompaniesHouseStream";
import { HIBPEmail } from "./modules/processes/HIBP/HIBPEmail";
import { HIBPPhone } from "./modules/processes/HIBP/HIBPPhone";
import { HunterDomainSearch } from "./modules/processes/Hunter/HunterDomainSearch";
import { HunterEmailSearch } from "./modules/processes/Hunter/HunterEmailSearch";
import { IPAPISearch } from "./modules/processes/IPAPI/IPAPISearch";
import { MailBoxLayerSearch } from "./modules/processes/MailBoxLayer/MailBoxLayerSearch";
import { Process } from "./modules/processes/Process";
import { Names192Search } from "./modules/processes/192/Names192Search";
import { Names192Process } from "./modules/processes/192/Names192Process";
import { SocketService } from "./modules/SocketService";
import { runMain } from "module";
import { CompaniesHouseCompaniesSearch } from "./modules/processes/CompaniesHouse/CompaniesHouseCompaniesSearch";


/*export class tomSandbox extends Process {

    constructor() {
        super(new SocketService(), 'Elliot Phillips');
    };

    

}*/



export async function run() {
    
    

    let socket = new SocketService();
    await socket.init();

    let x = new CompaniesHouseCompaniesSearch(socket, "Elliot Phillips");
    let y = await x.companiesSearch('Shop');
    console.log(y.data);
}