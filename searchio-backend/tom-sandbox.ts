import { Stream } from "./modules/streams/Stream";
import { CompaniesHouseStream } from "./modules/streams/CompaniesHouseStream";
import { HIBPEmail } from "./modules/processes/HIBP/HIBPEmail";
import { HIBPPhone } from "./modules/processes/HIBP/HIBPPhone";
import { HunterDomainSearch } from "./modules/processes/Hunter/HunterDomainSearch";
import { HunterEmailSearch } from "./modules/processes/Hunter/HunterEmailSearch";
import { IPAPISearch } from "./modules/processes/IPAPI/IPAPISearch";
import { MailBoxLayerSearch } from "./modules/processes/MailBoxLayer/MailBoxLayerSearch";
import { Process } from "./modules/processes/Process";
import { SocketService } from "./modules/SocketService";
import { CharityCommissionSearch } from "./modules/processes/CharityCommission/CharityCommissionSearch";

export async function run() {
    
    let socket = new SocketService();
    await socket.init();

    //let x = new CharityCommissionSearch(socket, "1172875"); //EAP
    //let x = new CharityCommissionSearch(socket, "221219"); //JEW
    //let x = new CharityCommissionSearch(socket, "1137163"); //CSU
    let x = new CharityCommissionSearch(socket, "1196556"); //LIC
    
    let y = await x.process();

    console.log("\n\nBack to sandbox")
    console.log(y.data);
}