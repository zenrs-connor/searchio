import { Router, Request, Response } from 'express';
import { QueryManager } from '../modules/QueryManager';
export const router = Router();

const QM = new QueryManager();

//  Simple test endpoint to see if the RESTful API is currently queriable
router.get('/test/', async (req: Request, res: Response) => { return res.status(200).json({ success: true, message: 'Successful API test!'}) });

//  Endpoint to ask the QueryManager to add a new Query
router.get('/query/add/:query', async (req: Request, res: Response) => { return res.status(200).json(await QM.add(req.params.query)); })
