/* DEPENDENCIES */
import * as express from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as fs from "fs";
import { createServer } from "http";
import { Server } from "socket.io";

/* MODULES */
import { router as API } from './controllers/api';
<<<<<<< HEAD
import { Stream } from "./modules/streams/Stream";
=======
import { PhoneNumberStream } from "./modules/streams/phone-numbers/PhoneNumberStream";
import { PhoneInfogaStream } from "./modules/streams/phone-numbers/PhoneInfogaStream";
import { EmailAddressStream } from "./modules/streams/email-addresses/EmailAddressStream";
import { HIBPEmailStream } from "./modules/streams/email-addresses/HIBPEmailStream";
import { HunterStream } from "./modules/streams/email-addresses/HunterStream";
import { HIBPPhoneStream } from "./modules/streams/phone-numbers/HIBPPhoneStream";
import { DomainStream } from "./modules/streams/domains/DomainStream";
import { HunterDomainStream } from "./modules/streams/domains/HunterDomainStream";
import { NumverifyStream } from "./modules/streams/phone-numbers/NumverifyStream";
import { MailBoxLayerStream } from "./modules/streams/email-addresses/MailBoxLayerStream";
import { IPStackStream } from "./modules/streams/domains/IPStackStream";
import { IPAPIStream } from "./modules/streams/domains/IPAPIStream";
import { CompaniesHouseStream } from "./modules/streams/businesses/CompaniesHouseStream";
import { OpenCorporatesStream } from "./modules/streams/businesses/OpenCorporatesStream";
import { BusinessStream } from "./modules/streams/businesses/BusinessesStream";

>>>>>>> origin/name-stream


const PORT = 5000;
const APP = express();
APP.use(cors());
APP.use(bodyParser.json({}));                            
APP.use(bodyParser.urlencoded({ extended: true }));

//  Controller routing
APP.use('/api/', API);


//  404 Handling, writing 
APP.use(function(req: any, res: any, next: any) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if(ip !== '::1') {
        console.log(`404 Error has occured from IP address: ${ip}. Check logs/ip_log.txt for details.`);
        fs.appendFileSync('./logs/ip_log.txt', `${new Date()}\t\t${ip}\t\t${req.protocol + '://' + req.get('host') + req.originalUrl}\n`);
        const err = new Error('Not Found');
    } else {
        console.log("Localhost 404 - Not Found");
    }
    
});

const HTTP_SERVER = createServer(APP);
const IO = new Server(HTTP_SERVER, {});


IO.on("connection", (socket) => {
    console.log("New WebSocket Connection", socket.id);
});

HTTP_SERVER.listen(PORT, () => {
    console.log(`SEARCHIO server is running on port ${PORT}`);
})


<<<<<<< HEAD
let stream = new Stream('abcA');
=======
const x = new OpenCorporatesStream("Trojan Vapes");
x.companyNumberSearch("gb", "12870867");
>>>>>>> origin/name-stream
