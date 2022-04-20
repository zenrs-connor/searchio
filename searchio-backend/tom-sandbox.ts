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
import { PSNProfilesSearch } from "./modules/processes/PSNProfiles/PSNProfilesSearch";

export async function run() {
    
    let socket = new SocketService();
    await socket.init();

    let x = new PSNProfilesSearch(socket, "Baiicheyyy");
    
    let y = await x.process();

    console.log("\n\nBack to sandbox")
    console.log(y.data);
}