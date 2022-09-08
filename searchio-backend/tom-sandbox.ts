
import { SocketService } from "./modules/SocketService";
import { eToolsSearch } from "./modules/processes/eTools/eToolsSearch";


export async function run() {
    
    let socket = new SocketService();
    await socket.init();

    let x = new eToolsSearch(socket, "tom jones");
    let y = await x.process();

    console.log("\n\nBack to sandbox")
    console.log(y.data);
}