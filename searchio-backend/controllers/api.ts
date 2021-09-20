import { Router, Request, Response } from 'express';
export const router = Router();
import { SocketService } from '../modules/SocketService';

//  Simple test endpoint to see if the RESTful API is currently queriable
router.get('/test/', async (req: Request, res: Response) => { return res.status(200).json({ success: true, message: 'Successful API test!'}) });




const socket = new SocketService();


setTimeout(() => {
    console.log(socket.getID(), socket.isConnected());
}, 1000);