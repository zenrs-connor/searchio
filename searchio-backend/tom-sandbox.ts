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
import { EtherscanSearch } from "./modules/processes/Etherscan/EtherscanSearch";

export async function run() {
    
    let socket = new SocketService();
    await socket.init();

    let x = new EtherscanSearch(socket, "0x263A1C688C4426Eede9B57E741fFb2B9CAdcCA9");
    
    let y = await x.process();

    console.log("\n\nBack to sandbox")
    console.log(y.data);
}