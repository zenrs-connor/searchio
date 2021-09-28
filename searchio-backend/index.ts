/* DEPENDENCIES */
import * as express from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as fs from "fs";
import { createServer } from "http";
import { Server } from "socket.io";

/* MODULES */
import { router as API } from './controllers/api';
import { Stream } from "./modules/streams/Stream";


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


let stream = new Stream('abcA');