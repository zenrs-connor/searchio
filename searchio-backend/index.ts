/* DEPENDENCIES */
import * as express from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as fs from "fs";
import { createServer } from "http";
import { Server } from "socket.io";

/* MODULES */
import { router as API } from './controllers/api';
import { ProcessResult } from "./models/ProcessResult";
import { ProcessData } from "./models/ProcessData";
import { QueryStatus } from "./models/QueryStatus";
import { run } from "./tom-sandbox";

const PORT = 3002;
const APP = express();
APP.use(cors());
APP.use(bodyParser.json({}));                            
APP.use(bodyParser.urlencoded({ extended: true }));

//  Controller routing
APP.use('/api/', API);

APP.use('/', express.static(__dirname + '/../searchio-frontend/dist/searchio-frontend'));

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

    console.log("(IO) New WebSocket Connection", socket.id);

    socket.on("join", (room: string) => {
        console.log(`(IO) Socket ${socket.id} joining room ${room}`);
        socket.join(room);
    });


    socket.on("send", (message) => {
        IO.to(socket.id).emit(message);
    })
    
    //  Event called when a Stream updates the status of one of its processes
    socket.on("process-update", (update: ProcessData) => {
        console.log(`(IO) Got process update from ${socket.id}`);
        IO.to(socket.id).emit("process-update", update);
    });

    //  Event called when a stream emits a result
    socket.on("process-result", (result: ProcessResult) => {
        console.log(`(IO) Got a result from ${socket.id}`);
        IO.to(socket.id).emit("process-result", result);
    });

    
    //  Event called when a Query's status is updated
    socket.on("query-update", (update: QueryStatus) => {
        console.log(`(IO) Got query update from ${socket.id}`);
        IO.to(socket.id).emit("query-update", update);
    });

});

/*IO.of("/").adapter.on("create-room", (room) => {
    console.log(`(IO) Created a new room: ${room}`);
});*/

HTTP_SERVER.listen(PORT, () => {
    console.log(`SEARCHIO server is running on port ${PORT}`);
});

run();