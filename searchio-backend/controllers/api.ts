import { Router, Request, Response } from 'express';
import { QueryManager } from '../modules/QueryManager';
export const router = Router();

const QM = new QueryManager();

//  Simple test endpoint to see if the RESTful API is currently queriable
router.get('/test/', async (req: Request, res: Response) => { return res.status(200).json({ success: true, message: 'Successful API test!'}) });

//  Ask the QueryManager to add a new Query
router.get('/query/add/:query', async (req: Request, res: Response) => { return res.status(200).json(await QM.add(req.params.query)); })

//  Get an existing query from the QueryManager
router.get('/query/get/:query', async (req: Request, res: Response) => { return res.status(200).json(await QM.get(req.params.query)); })

//  Instruct the QueryManager to kill an active Query
router.get('/query/kill/:query', async (req: Request, res: Response) => { return res.status(200).json(await QM.kill(req.params.query)); })