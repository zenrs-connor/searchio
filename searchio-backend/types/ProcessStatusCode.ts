export type ProcessCode = 
 1   //  DORMANT
| 2   //  ACTIVE
| 3   //  COMPLETED
| 4   //  ERROR

export type ProcessStatus =
"DORMANT" |
"ACTIVE" |
"COMPLETED" |
"ERROR";

export const ProcessStatusCodeEnum = {
  
  1: "DORMANT",
  2: "ACTIVE",
  3: "COMPLETED",
  4: "ERROR",

  "DORMANT": 1,
  "ACTIVE": 2,
  "COMPLETED": 3,
  "ERROR": 4,

}