import { SearchioResponse } from "../../models/SearchioResponse";
import { error, success } from "../ResponseHandler";
import { ScraperStream } from "./ScraperStream";
import { WebElement } from "selenium-webdriver";
import { Stream } from "./Stream";
import { Console } from "console";
import { copyFile } from "fs";


const request = require('request');
const OPENCORPORATES_API_KEY = '';

export class OpenCorporatesStream extends ScraperStream {
    constructor(query: string) {
        super(query);
        this.tags.push("open-corporates");
        console.log(this.tags);
    }

    // API Functions
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


    // Scraper Functions

    // Scrapes a comapnies overview information
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

            return success(`(OpenCorporatesScraperStream) Successfully collected company overview`, overviewFormat);
        } catch(err) {
            console.log(err);
            return error(`(OpenCorporatesScraperStream) Error collecting company overview`, err)
        }
    }

    // Scrapes a companies statements of controll
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

            //console.log(statementsArray);

            return success(`(OpenCorporatesScraperStream) Successfully collected company statements of control`, statementsArray);
        } catch(err) {
            console.log(err);
            return error(`(OpenCorporatesScraperStream) Error collecting company statements of control`, err)
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

            return success(`(OpenCorporatesScraperStream) Successfully collected company filings`, filingsArray);
        } catch(err) {
            console.log(err);
            return error(`(OpenCorporatesScraperStream) Error collecting company filings`, err)
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
            return success(`(OpenCorporatesScraperStream) Successfully collected a page of company filings`, pageFilings);
        } catch(err) {
            console.log(err);
            return error(`(OpenCorporatesScraperStream) Error collecting current page of company filings`, err)
        }
    }

    // Main function called to do a complete scrape on a company
    public async scrapeCompany(countryCode: string, companyNumber: string): Promise<SearchioResponse> {
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

            console.log(company);

            return success(`(OpenCorporatesScraperStream) Successfully scraped a company`, company);
        } catch(err) {
            console.log(err);
            return error(`(OpenCorporatesScraperStream) Error scraping a company`, err)
        }
    }


    // Function to scrape page of people resulting from a name search
    public async scrapePeople(people: any[]): Promise<SearchioResponse> {
        try {
            let peopleArray: any[] = [];

            for(let person of people) {
                
                let personFormat: {
                    name: string,
                    role?: string,
                    roleStatus?: string,
                    personLink?: string,
                    companyJurisdiction?: string,
                    companyStatus?: string,
                    companyName?: string,
                    companyNumber?: string,
                    companyStart?: string,
                    companyEnd?: string,
                    companyLink?: string
                } = {
                    name: undefined
                };


                let name = await person.findElement(this.webdriver.By.xpath('./a')).getText();
                personFormat.name = name;
                
                let roleStatus = await person.findElement(this.webdriver.By.xpath('./a')).getAttribute('class');
                if(roleStatus == "officer") {
                    roleStatus = "Active";
                    personFormat.roleStatus = roleStatus;
                } else if (roleStatus == "officer inactive") {
                    roleStatus = "Inactive"
                    personFormat.roleStatus = roleStatus;
                } else {
                    personFormat.roleStatus = `(OpenCorporatesStream could not handle person with role status: ${roleStatus})`;
                }

                let personLink = await person.findElement(this.webdriver.By.xpath('./a')).getAttribute('href');
                personFormat.personLink = personLink;

                let companyJurisdiction = await person.findElement(this.webdriver.By.xpath('./a[2]')).getAttribute('class');
                companyJurisdiction = companyJurisdiction.replace("jurisdiction_filter ","").toUpperCase();
                personFormat.companyJurisdiction = companyJurisdiction;

                let companyStatus = await person.findElement(this.webdriver.By.xpath('./a[3]')).getAttribute('class');
                if(companyStatus.includes("inactive")) {
                    companyStatus = "Inactive";
                    personFormat.companyStatus = companyStatus;
                } else {
                    companyStatus = "Active";
                    personFormat.companyStatus = companyStatus;
                }

                let companyName = await person.findElement(this.webdriver.By.xpath('./a[3]')).getText();
                personFormat.companyName = companyName;

                let companyNumber = await person.findElement(this.webdriver.By.xpath('./a[3]')).getAttribute('title');
                companyNumber = companyNumber.split(" ");
                companyNumber = companyNumber[companyNumber.length - 1].replace(')', '');
                personFormat.companyNumber = companyNumber;

                let startDate = await person.findElements(this.webdriver.By.xpath('.//span[@class="start_date"]'));
                if(startDate.length > 0){
                    startDate = await person.findElement(this.webdriver.By.xpath('.//span[@class="start_date"]')).getText();
                    personFormat.companyStart = startDate;
                } else {
                    startDate = "Not available";
                    personFormat.companyStart = startDate;
                }
                
                let endDate = await person.findElements(this.webdriver.By.xpath('.//span[@class="end_date"]'));
                if(endDate.length > 0){
                    endDate = await person.findElement(this.webdriver.By.xpath('.//span[@class="end_date"]')).getText();
                    personFormat.companyEnd = endDate;
                } else {
                    endDate = "Not available";
                    personFormat.companyEnd = endDate;
                }

                let role = await person.getText()
                role = role.split(",")[0];
                if(role.includes("agent")) {
                    role = "Agent";
                    personFormat.role = role;
                } else if(role.includes("secretary")) {
                    role = "Secretary";
                    personFormat.role = role;
                } else if(role.includes("president")) {
                    role = "President";
                    personFormat.role = role;
                } else if(role.includes("vice president")) {
                    role = "Vice President";
                    personFormat.role = role;
                } else if(role.includes("incorporator")) {
                    role = "Incorporator";
                    personFormat.role = role;
                } else if(role.includes("director")) {
                    role = "Director";
                    personFormat.role = role;
                } else if(role.includes("treasurer")) {
                    role = "Treasurer";
                    personFormat.role = role;
                } else if(role.includes("ceo")) {
                    role = "CEO";
                    personFormat.role = role;
                } else if(role.includes("chief executive officer")) {
                    role = "CEO";
                    personFormat.role = role;
                } else if(role.includes("incorporator")) {
                    role = "Incorporator";
                    personFormat.role = role;
                } else if(role.includes("manager")) {
                    role = "Manager";
                    personFormat.role = role;
                } else if(role.includes("member")) {
                    role = "Member";
                    personFormat.role = role;
                } else if(role.includes("govenor")) {
                    role = "Governor";
                    personFormat.role = role;
                } else if(role.includes("cfo")) {
                    role = "CFO";
                    personFormat.role = role;
                } else if(role.includes("organizer")) {
                    role = "Organizer";
                    personFormat.role = role;
                } else {
                    let link = await person.findElement(this.webdriver.By.xpath("./a")).getAttribute('href');
                    role = `Unknown (${link})`;
                    personFormat.role = role;
                }

                let companyLink = await person.findElement(this.webdriver.By.xpath('./a[3]')).getAttribute('href');
                personFormat.companyLink = companyLink;

                peopleArray.push(personFormat);

            }

            return success(`(OpenCorporatesScraperStream) Successfully scraped a company`, peopleArray);
        } catch(err) {
            console.log(err);
            return error(`(OpenCorporatesScraperStream) Error scraping a company`, err);
        }
    }

    // Function to search for current or prior officers within a company
    public async nameSearch(name: string): Promise<SearchioResponse> {
        try {
            name = name.replace(/\s+/g, '+');
            await this.driver.get(`https://opencorporates.com/officers?jurisdiction_code=&q=${name}&utf8=%E2%9C%93`);
            let people = await this.flipThrough('//li[@class="next next_page "]/a', '//ul[@class="officers unstyled"]/li', this.scrapePeople.bind(this), 25);
            console.log(people.data);
            return success(`(OpenCorporatesScraperStream) Successfully scraped a company`);
        } catch(err) {
            console.log(err);
            return error(`(OpenCorporatesScraperStream) Error scraping a company`, err);
        }
    }
}