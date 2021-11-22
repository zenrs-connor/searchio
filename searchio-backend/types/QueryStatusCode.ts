export type QueryStatusCode = 
1    
| 2   
| 3
| 4 
| "DORMANT"
| "ACTIVE"
| "COMPLETED"
| "ERROR";


export const QueryStatusCodeEnum: any = {
    1: "DORMANT",
    2: "ACTIVE",
    3: "COMPLETED",
    4: "ERROR",

    "DORMANT": 1,
    "ACTIVE": 2,
    "COMPLETED": 3, 
    "ERROR": 4 
}