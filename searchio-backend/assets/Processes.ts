import { DVLAVehicleCheck } from "../modules/processes/DVLA/DVLAVehicleCheck";
import { HaveIBeenPwnedBreaches } from "../modules/processes/HIBP/HaveIBeenPwnedBreaches";
import { HaveIBeenPwnedPastes } from "../modules/processes/HIBP/HaveIBeenPwnedPastes";
import { NumverifyValidate } from "../modules/processes/Numverify/NumverifyValidate";
import { Names192Search } from "../modules/processes/192/Names192Search";
import { CompaniesHouseCompaniesSearch } from "../modules/processes/CompaniesHouse/CompaniesHouseCompaniesSearch";
import { CompaniesHouseCompanySearch } from "../modules/processes/CompaniesHouse/CompaniesHouseCompanySearch";
import { CompaniesHouseOfficerSearch } from "../modules/processes/CompaniesHouse/CompaniesHouseOfficerSearch";
import { HunterDomainSearch } from "../modules/processes/Hunter/HunterDomainSearch";
import { HunterEmailSearch } from "../modules/processes/Hunter/HunterEmailSearch";

import { HMLandRegistryDomestic  } from "../modules/processes/HMLandRegistry/HMLandRegistryDomestic";

import { ICIJSearch } from "../modules/processes/ICIJ/ICIJSearch";
import { IPAPISearch } from "../modules/processes/IPAPI/IPAPISearch";
import { IPStackSearch } from "../modules/processes/IPStack/IPStackSearch";
import { MailBoxLayerSearch } from "../modules/processes/MailBoxLayer/MailBoxLayerSearch";
import { OpenCorporatesCompanySearch } from "../modules/processes/OpenCorporates/OpenCorporatesCompanySearch";
import { OpenCorporatesCompaniesSearch } from "../modules/processes/OpenCorporates/OpenCorporatesCompaniesSearch";
import { OpenCorporatesOfficerSearch } from "../modules/processes/OpenCorporates/OpenCorporatesOfficerSearch";

import { PhoneInfogaSearch } from "../modules/processes/PhoneInfoga/PhoneInfogaSearch";
import { StreetCheckSearch } from "../modules/processes/StreetCheck/StreetCheckSearch";
import { ERICSearch } from "../modules/processes/ERIC/ERICSearch";

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
    HaveIBeenPwnedBreaches,
    HaveIBeenPwnedPastes,

    //  192
    Names192Search,

    //  Companies House
    CompaniesHouseCompaniesSearch,
    CompaniesHouseCompanySearch,
    CompaniesHouseOfficerSearch,

    // Hunter
    HunterDomainSearch,

    //  HM Land Registry
    //HMLandRegistryDomestic,

    //  ICIJ
    ICIJSearch,

    // IPAPI
    IPAPISearch,

    //  IPStack
    IPStackSearch,


    //  MailBoxLayer
    MailBoxLayerSearch,


    // OpenCorprates
    OpenCorporatesCompanySearch,
    OpenCorporatesCompaniesSearch,
    OpenCorporatesOfficerSearch,


    // PhoneInfoga
    //PhoneInfogaSearch,

    //  StreetCheck
    StreetCheckSearch,

    // ERIC
    ERICSearch,

]