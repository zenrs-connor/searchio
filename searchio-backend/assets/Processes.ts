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
import { BlogSearchEngineSearch } from "../modules/processes/BlogSearchEngine/BlogSearchEngineSearch";
import { SteamSearch } from "../modules/processes/Steam/SteamSearch";
import { WhatsMyNameSearch } from "../modules/processes/WhatsMyName/WhatsMyNameSearch";
import { URLScanSearch } from "../modules/processes/URLScan/URLScanSearch";
import { CheckUsernamesSearch } from "../modules/processes/CheckUsernames/CheckUsernamesSearch";
import { PositionstackForward } from "../modules/processes/Positionstack/PositionstackForward";
import { PositionstackReverse } from "../modules/processes/Positionstack/PositionstackReverse";
import { GigablastSearch } from "../modules/processes/Gigablast/GigablastSearch";
import { eToolsSearch } from "../modules/processes/eTools/eToolsSearch";
import { DuckDuckGoSearch } from "../modules/processes/DuckDuckGo/DuckDuckGoSearch";


/*
*   This array contains prototypes of the processes that will be checked on each query.
*   As more data sources are added to the list
*/

export const PROCESSES: any = [

    // Numverify Processes
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

    // CheckUsername
    CheckUsernamesSearch,
    
    //  Positionstack
    PositionstackForward,
    PositionstackReverse,
    
    //  StreetCheck
    StreetCheckSearch,

    // Steam
    SteamSearch,

    // Blog Search Engine 
    BlogSearchEngineSearch,
    
    // Steam
    SteamSearch,

    //  WhatsMyName
    WhatsMyNameSearch,

    //  Gigablast
    GigablastSearch,

    // eTools
    eToolsSearch,

    //  DuckDuckGo
    DuckDuckGoSearch,

    /*
        BACKBURNER
    */

    //  URLScanSearch,                  //  CAPTCHA getting in the way of scraping
    //  PhoneInfogaSearch,


]