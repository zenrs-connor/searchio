import { DVLAVehicleCheck } from "../modules/processes/DVLA/DVLAVehicleCheck";
import { HaveIBeenPwnedBreaches } from "../modules/processes/HIBP/HaveIBeenPwnedBreaches";
import { NumverifyValidate } from "../modules/processes/Numverify/NumverifyValidate";

/*
*   This array contains prototypes of the processes that will be checked on each query.
*   As more data sources are added to the list
*/

export const PROCESSES: any = [

    //  Numverify Processes

    NumverifyValidate,

    //  DVLA Processes

    DVLAVehicleCheck,

    // HaveIBeenPwned Processes

    HaveIBeenPwnedBreaches
]