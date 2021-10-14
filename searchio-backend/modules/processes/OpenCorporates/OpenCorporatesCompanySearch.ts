import { SearchioResponse } from "../../../models/SearchioResponse";
import { Console } from "console";
import { copyFile } from "fs";
import { OpenCorporatesProcess } from "./OpenCorporatesProcess";
import { SocketService } from "../../SocketService";
import { BUSINESS } from "../../../assets/RegexPatterns";


const request = require('request');

export class OpenCorporatesCompanySearch extends OpenCorporatesProcess {
    
    protected id = "OpenCorporatesCompanySearch";           
    protected name: "Company Check";
    protected pattern: RegExp = BUSINESS;
    
    
    //  Process extends the ResponseEmitter class, so be sure to include an argument for the socket
    //  Processes also take a query on creation
    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }


    //  Overwrite of the abstract function held in Process.ts
    //  This function is what is called when the Process executes
    //  It returns a SearchioResponse containing any success or error data
    protected async process(): Promise<SearchioResponse> {
        this.initWebdriver();
        let result = await this.scrapeCompany();
        this.destroyWebdriver();
        return result;
    }



    /*


        ----- API FUNCTIONALITY -----


    */


    public async companyNameSearch(companyName: string) {
        let response;

        await new Promise((resolve) => {

            this.reformat(companyName).then(companyName => {
                let url = `https://api.opencorporates.com/v0.4/companies/search?q=${companyName}`;

                request(url, async (err, res, body) => {

                    console.log(JSON.parse(body).results.companies[0]);
                    response = body;

                    if(err) {
                        response = { success: false, error: err };
                    }
                    resolve(undefined);
                });
            });
        });

        return response;
    }

    public async companyNumberSearch(countryCode: string, companyNumber: string) {
        let response;

        await new Promise((resolve) => {

            let url = `https://api.opencorporates.com/v0.4/companies/gb/${companyNumber}`;

            request(url, async (err, res, body) => {

                console.log(JSON.parse(body).results.company);
                console.log(JSON.parse(body).results.company.filings);
                response = body;

                if(err) {
                    response = { success: false, error: err };
                }
                resolve(undefined);
            });
        });

        return response;
    }

    public async officerSearch(name: string) {
        let response;

        await new Promise((resolve) => {

            this.reformat(name).then(name => {
                let url = `https://api.opencorporates.com/v0.4/officers/search?q=${name}`;

                request(url, async (err, res, body) => {

                    console.log(body);
                    response = body;

                    if(err) {
                        response = { success: false, error: err };
                    }
                    resolve(undefined);
                });
            });
        });

        return response;
    }



    /*


        ----- SCRAPER FUNCTIONALITY -----


    */


    // Scrapes a companies overview information
    public async scrapeOverview(countryCode: string, companyNumber: string): Promise<SearchioResponse> {
        
        try {
            await this.driver.get(`https://opencorporates.com/companies/${countryCode}/${companyNumber}`);
            let companyName = await this.driver.findElement(this.webdriver.By.xpath('//h1[@class="wrapping_heading fn org"]')).getText();
            let overview = await this.driver.findElement(this.webdriver.By.xpath('//dl[@class="attributes dl-horizontal"]'));

            let overviewFormat: {   
                companyNumber: string, 
                companyName: string,
                companyAddress?: string, 
                status?: string,
                companyType?: string,
                creationDate?: Date,
                dissolutionDate?: Date,
                jurisdiction? : string,
                owners?: string[],
                industryCodes?: string[],
                latestAccounts?: Date,
                latestAnnualReturn?: Date,
                activeDirectorsOfficers?: string[],
                inactiveDirectorsOfficers?: string[],
                registryPage?: string
            } = {
                companyNumber: undefined,
                companyName: undefined
            };

            overviewFormat.companyName = companyName;
            overviewFormat.companyNumber = companyNumber;

            let status = await overview.findElement(this.webdriver.By.xpath('.//dd[@class="status"]')).getText();
            overviewFormat.status = status;

            let creationDate = await overview.findElement(this.webdriver.By.xpath('.//dd[@class="incorporation_date"]/span')).getText();
            overviewFormat.creationDate = new Date(creationDate);

            let dissolutionDate = await overview.findElements(this.webdriver.By.xpath('.//dd[@class="dissolution date"]'));
            if(dissolutionDate.length > 0) {
                dissolutionDate = await overview.findElement(this.webdriver.By.xpath('.//dd[@class="dissolution date"]')).getText();
                overviewFormat.dissolutionDate = new Date(dissolutionDate);
            }
            
            let companyType = await overview.findElement(this.webdriver.By.xpath('.//dd[@class="company_type"]')).getText();
            overviewFormat.companyType = companyType;

            let jurisdiction = await overview.findElement(this.webdriver.By.xpath('.//dd[@class="jurisdiction"]/a')).getText();
            overviewFormat.jurisdiction = jurisdiction;

            let owners = await overview.findElements(this.webdriver.By.xpath('.//dd[@class="ultimate_beneficial_owners"]/ul/li'));
            if(owners.length > 0) {
                let ownersArray = [];
                for(let owner of owners) {
                    let name = await owner.getText();
                    ownersArray.push(name);
                }
                overviewFormat.owners = ownersArray;
            }

            let companyAddress = await overview.findElement(this.webdriver.By.xpath('.//dd[@class="registered_address adr"]')).getText();
            overviewFormat.companyAddress = companyAddress.replace(/\n/g, ", ");

            let industryCodes = await overview.findElements(this.webdriver.By.xpath('.//dd[@class="industry_codes"]/ul/li'));
            if(industryCodes.length > 0) {
                let industryCodesArray = [];
                for(let industryCode of industryCodes) {
                    let code = await industryCode.getText();
                    industryCodesArray.push(code);
                }
                overviewFormat.industryCodes = industryCodesArray;
            }

            let latestAccounts = await overview.findElements(this.webdriver.By.xpath('.//dd[@class="latest_accounts_date"]'));
            if(latestAccounts.length > 0) {
                latestAccounts = await overview.findElement(this.webdriver.By.xpath('.//dd[@class="latest_accounts_date"]')).getText();
                overviewFormat.latestAccounts = new Date(latestAccounts);
            }
            

            let latestAnnualReturn = await overview.findElements(this.webdriver.By.xpath('.//dd[@class="annual_return_last_made_up_date"]'));
            if(latestAnnualReturn.length > 0) {
                latestAnnualReturn =  await overview.findElement(this.webdriver.By.xpath('.//dd[@class="annual_return_last_made_up_date"]')).getText();
                overviewFormat.latestAnnualReturn = new Date(latestAnnualReturn);
            }


            // Check to see if 'SEE ALL' button is present
            let seeAllActiveOfficersButton = await overview.findElements(this.webdriver.By.xpath('//a[@class="officer"]/../../following-sibling::div/a'));
            if(seeAllActiveOfficersButton.length > 0) {
                for(let button of seeAllActiveOfficersButton) {
                    await button.click();
                }
            }

            let seeAllInactiveOfficersButton = await overview.findElements(this.webdriver.By.xpath('//a[@class="officer inactive"]/../../following-sibling::div/a'));
            if(seeAllInactiveOfficersButton.length > 0) {
                for(let button of seeAllInactiveOfficersButton) {
                    await button.click();
                }
            }



            let activeDirectorsOfficers = await overview.findElements(this.webdriver.By.xpath('.//a[@class="officer"]'));
            if(activeDirectorsOfficers.length > 0) {
                let activeDirectorsOfficersArray = [];
                for(let directorOfficer of activeDirectorsOfficers) {
                    let res = await directorOfficer.findElement(this.webdriver.By.xpath('./..')).getText();
                    activeDirectorsOfficersArray.push(res + "present");
                }
                overviewFormat.activeDirectorsOfficers = activeDirectorsOfficersArray;
            }

            let inactiveDirectorsOfficers = await overview.findElements(this.webdriver.By.xpath('.//a[@class="officer inactive"]'));
            if(inactiveDirectorsOfficers.length > 0) {
                let inactiveDirectorsOfficersArray = [];
                for(let directorOfficer of inactiveDirectorsOfficers) {
                    let res = await directorOfficer.findElement(this.webdriver.By.xpath('./..')).getText();
                    inactiveDirectorsOfficersArray.push(res);
                }
                overviewFormat.inactiveDirectorsOfficers = inactiveDirectorsOfficersArray;
            }

            let registryPage = await overview.findElement(this.webdriver.By.xpath('.//dd[@class="registry_page"]/a')).getAttribute('href');
            overviewFormat.registryPage = registryPage;

            return this.success(`(OpenCorporatesScraperStream) Successfully collected company overview`, overviewFormat);

        } catch(err) {
            return this.error(`(OpenCorporatesScraperStream) Error collecting company overview`, err)
        }
    }

    // Scrapes a companies statements of control
    public async scrapeStatementsOfControl(countryCode: string, companyNumber: string): Promise<SearchioResponse> {
        try{
            await this.driver.get(`https://opencorporates.com/companies/${countryCode}/${companyNumber}`);
            
            let statementsArray: any[] = [];

            let statements = await this.driver.findElements(this.webdriver.By.xpath('//div[@id="data-table-control_statement_object"]/div/table/tbody/tr'));
            for(let statement of statements) {

                let statementFormat: {   
                    date: Date, 
                    desc?: string,
                    mechanisms?: string, 
                    details?: string
                } = {
                    date: undefined,
                };

                let statementDate = await statement.findElement(this.webdriver.By.xpath('./td')).getText();
                statementFormat.date = new Date(statementDate);

                let desc = await statement.findElement(this.webdriver.By.xpath('./td[2]')).getText();
                statementFormat.desc = desc;

                let mechanisms = await statement.findElement(this.webdriver.By.xpath('./td[3]')).getText();
                statementFormat.mechanisms = mechanisms;

                let details = await statement.findElement(this.webdriver.By.xpath('./td[5]/a')).getAttribute('href');
                statementFormat.details = details;

                statementsArray.push(statementFormat);
            }

            statements = await this.driver.findElements(this.webdriver.By.xpath('//div[@id="data-table-control_statement_subject"]/div/table/tbody/tr'));
            for(let statement of statements) {

                let statementFormat: {   
                    date: Date, 
                    desc?: string,
                    mechanisms?: string, 
                    details?: string
                } = {
                    date: undefined,
                };

                let statementDate = await statement.findElement(this.webdriver.By.xpath('./td')).getText();
                statementFormat.date = new Date(statementDate);

                let desc = await statement.findElement(this.webdriver.By.xpath('./td[2]')).getText();
                statementFormat.desc = desc;

                let mechanisms = await statement.findElement(this.webdriver.By.xpath('./td[3]')).getText();
                statementFormat.mechanisms = mechanisms;

                let details = await statement.findElement(this.webdriver.By.xpath('./td[5]/a')).getAttribute('href');
                statementFormat.details = details;

                statementsArray.push(statementFormat);
            }

            return this.success(`(OpenCorporatesScraperStream) Successfully collected company statements of control`, statementsArray);

        } catch(err) {
            return this.error(`(OpenCorporatesScraperStream) Error collecting company statements of control`, err)
        }
    }

    // Scrapes a companies filings
    public async scrapeFilings(countryCode: string, companyNumber: string): Promise<SearchioResponse> {
        try {
            await this.driver.get(`https://opencorporates.com/companies/${countryCode}/${companyNumber}/statements/filing_delegate`);

            //let filings = await this.driver.findElements(this.webdriver.By.xpath('//div[@id="data-table-filing_delegate"]/div/table/tbody/tr'));
            //console.log(filings.length);

            // if(filings.length > 19) {
            //     let link = await this.driver.findElement(this.webdriver.By.xpath('//div[@id="data-table-filing_delegate"]/../../following-sibling::div/div/a')).getAttribute('href');
            //     console.log(link);
            // }

            let filings = await this.flipThrough('//li[@class="next next_page "]/a', '//div[@id="data-table-filing_delegate"]/div/table/tbody/tr', this.scrapeFilingsPage.bind(this), 25);
            let filingsArray = filings.data;

            return this.success(`(OpenCorporatesScraperStream) Successfully collected company filings`, filingsArray);

        } catch(err) {
            return this.error(`(OpenCorporatesScraperStream) Error collecting company filings`, err)
        }
    }

    // Scrapes a companies individual filing
    public async scrapeFilingsPage(filings: any[]): Promise<SearchioResponse> {
        try{ 
            let pageFilings: any[] = []
            
            for(let filing of filings) {

                let filingFormat: {   
                    date: Date, 
                    title?: string,
                    desc?: string, 
                    details?: string
                } = {
                    date: undefined,
                };

                let filingDate = await filing.findElement(this.webdriver.By.xpath('./td')).getText();
                filingFormat.date = filingDate;

                let title = await filing.findElement(this.webdriver.By.xpath('./td[2]')).getText();
                filingFormat.title = title;

                let desc = await filing.findElement(this.webdriver.By.xpath('./td[3]')).getText();
                filingFormat.desc = desc;

                let details = await filing.findElement(this.webdriver.By.xpath('./td[5]/a')).getAttribute('href');
                filingFormat.details = details;

                pageFilings.push(filingFormat);

            }

            return this.success(`(OpenCorporatesScraperStream) Successfully collected a page of company filings`, pageFilings);

        } catch(err) {
            return this.error(`(OpenCorporatesScraperStream) Error collecting current page of company filings`, err)
        }
    }

    // Main function called to do a complete scrape on a company
    public async scrapeCompany(countryCode: string = 'GB', companyNumber: string = this.query): Promise<SearchioResponse> {
        try{
            let company: {   
                overview: {}, 
                statements?: any[],
                filings?: any[]
            } = {
                overview: undefined,
            };

            let overview = await this.scrapeOverview(countryCode, companyNumber);

            let statements = await this.scrapeStatementsOfControl(countryCode, companyNumber);

            let filings = await this.scrapeFilings(countryCode, companyNumber);

            company.overview = overview.data;
            company.statements = statements.data;
            company.filings = filings.data

            return this.success(`(OpenCorporatesScraperStream) Successfully scraped a company`, company);

        } catch(err) {
            return this.error(`(OpenCorporatesScraperStream) Error scraping a company`, err)
        }
    }

}