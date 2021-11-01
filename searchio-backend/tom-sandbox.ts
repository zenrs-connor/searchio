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
import { CompaniesHouseCompaniesSearch } from "./modules/processes/CompaniesHouse/CompaniesHouseCompaniesSearch";
import { HMLandRegistryOverseas } from "./modules/processes/HMLandRegistry/HMLandRegistryOverseas";
import { HMLandRegistryDomestic } from "./modules/processes/HMLandRegistry/HMLandRegistryDomestic";
import { CompaniesHouseCompanySearch } from "./modules/processes/CompaniesHouse/CompaniesHouseCompanySearch";
import { CompaniesHouseOfficerSearch } from "./modules/processes/CompaniesHouse/CompaniesHouseOfficerSearch";
import { OpenCorporatesCompaniesSearch } from "./modules/processes/OpenCorporates/OpenCorporatesCompaniesSearch";
import { OpenCorporatesOfficerSearch } from "./modules/processes/OpenCorporates/OpenCorporatesOfficerSearch";
import { HMLandRegistryPrices } from "./modules/processes/HMLandRegistry/HMLandRegistryPrices";



export async function run() {
    
    let socket = new SocketService();
    await socket.init();

    let x = new HMLandRegistryPrices(socket, "14 Thesiger Street");
    let y = await x.process();

    console.log("\n\nBack to sandbox")
    console.log(y);

}