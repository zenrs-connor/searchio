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
import { StreetCheckSearch } from "../modules/processes/StreetCheck/StreetCheckSearch"
import { BizNarSearch } from "../modules/processes/BizNar/BizNarSearch";
import { LiveuamapSearch } from "../modules/processes/Liveuamap/LiveuamapSearch";
import { YahooSearch } from "../modules/processes/Yahoo/YahooSearch";
import { EpieosSkypeSearch } from "../modules/processes/EpieosSkype/EpieosSkypeSearch";
import { UKTradeInfoSearch } from "../modules/processes/UKTradeInfo/UKTradeInfoSearch";
import { TwitterAuditSearch } from "../modules/processes/TwitterAudit/TwitterAuditSearch";
import { PSNProfilesSearch } from "../modules/processes/PSNProfiles/PSNProfilesSearch";
import { XboxGamertagSearch } from "../modules/processes/XboxGamertag/XboxGamertagSearch";
import { GoogleScholarSearch } from "../modules/processes/GoogleScholar/GoogleScholarSearch";
import { InsolvencyServiceSearchFirms } from "../modules/processes/InsolvencyService/InsolvencyServiceSearchFirms";
import { InsolvencyServiceSearchIndividuals } from "../modules/processes/InsolvencyService/InsolvencyServiceSearchIndividuals";
import { GoogleTranslateSearch } from "../modules/processes/GoogleTranslate/GoogleTranslateSearch";
import { FCAIndividualSearch } from "../modules/processes/FCA/FCAIndividualSearch";
import { FCAFirmSearch } from "../modules/processes/FCA/FCAFirmSearch";
import { EmailRepSearch } from "../modules/processes/EmailRep/EmailRepSearch";
import { ERICSearch } from "../modules/processes/ERIC/ERICSearch";
import { WorldCatSearch } from "../modules/processes/WorldCat/WorldCatSearch";
import { DOAJSearch } from "../modules/processes/DOAJ/DOAJSearch";
import { CarbonDateSearch } from "../modules/processes/CarbonDate/CarbonDateSearch";
import { EtherscanSearch } from "../modules/processes/Etherscan/EtherscanSearch";
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

    //  DOAJ
    DOAJSearch,
  
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

    //  BizNar
    BizNarSearch,
    
    //  Yahoo
    YahooSearch,
    
    //  PSN
    PSNProfilesSearch,
    
    //  XBOX
    XboxGamertagSearch
    
    //  Google Scholar
    GoogleScholarSearch
    
    //  Insolveny Service
    InsolvencyServiceSearchFirms,
    InsolvencyServiceSearchIndividuals,
    
    //  Google
    GoogleTranslateSearch,
    
    //  FCA
    FCAIndividualSearch,
    FCAFirmSearch,

    // CarbonDate
    CarbonDateSearch
    
    //  Etherscan
    EtherscanSearch,
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
    
    // ERIC
    ERICSearch,
    
    /*
        BACKBURNER
    */

    //  URLScanSearch,                  //  CAPTCHA getting in the way of scraping
    //  PhoneInfogaSearch,
    //  WorldCatSearch,                 //  Problem flipping through pages
    //  EmailRepSearch,                 //  Very small API rate limit
    //  TwitterAuditSearch              //  User protections in place
    //  UKTradeInfoSearch,              //  Website Error
    //  EpieosSkypeSearch,              //  CAPTCHA block
    //  LiveuamapSearch,                //  Paywall
    
]