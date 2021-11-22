import { SearchioResponse } from "../../../models/SearchioResponse";
import { OpenOwnershipProcess } from "./OpenOwnershipProcess";
import { SocketService } from "../../SocketService";
import { BUSINESS } from "../../../assets/RegexPatterns";


const request = require('request');

export class OpenOwnershipCompanySearch extends OpenOwnershipProcess {
    
    protected id = "OpenOwnershipCompanySearch";           
    protected name: "Company Search";
    protected pattern: RegExp = BUSINESS;
    
    
    //  Process extends the ResponseEmitter class, so be sure to include an argument for the socket
    //  Processes also take a query on creation
    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }


    //  Overwrite of the abstract function held in Process.ts
    //  This function is what is called when the Process executes
    //  It returns a SearchioResponse containing any success or error data
    public async process(): Promise<SearchioResponse> {
        this.initWebdriver(false);
        let result = await this.search();
        this.destroyWebdriver();
        return result;
    }


    // Scrapes a companies filings
    public async loadSearch(companyNumber: string): Promise<SearchioResponse> {
        try {
            companyNumber = companyNumber.replace(' ', '+');
            await this.driver.get(`https://register.openownership.org/search?utf8=%E2%9C%93&q=${companyNumber}`);

            // Click first result
            let noResults = await this.driver.findElements(this.webdriver.By.xpath('//div[@class="no-results"]'));
            if(noResults.length > 0) {
                return this.success(`No results for ${this.query}`);
            } else {
                await this.driver.findElement(this.webdriver.By.xpath('//ul[@class="list-unstyled list-entities"]/li/div/div/a')).click();
                return this.success(`Successfully loaded search`);
            }

        } catch(err) {
            return this.error(`Error loading search`, err)
        }
    }


    // Scrapes a company
    public async scrapeCompany(): Promise<SearchioResponse> {
        try{
            let companyFormat: {   
                companyName?: string, 
                companyNumber?: string,
                address?: string,
                incorporationDate?: string,
                companyStatus?: string,
                industryCodes?: string,
                officers?: any
            } = {
                companyName: undefined,
            };

            let companyName = await this.driver.findElement(this.webdriver.By.xpath('//h1[@class="entity-name"]')).getText();

            let companyNumber = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="entity-header-meta meta"]/p')).getText();

            let address = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="content entity-content"]/div/div/div[2]/div/div/p')).getText();

            let incorporationDate = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="content entity-content"]/div/div/div[2]/div/div/p[2]')).getText();

            let companyStatus = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="js-opencorporates-additional-info"]/div/div/p')).getText();

            let inudstryCodes = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="js-opencorporates-additional-info"]/div/div/p[2]')).getText();

            let officers = await this.driver.findElements(this.webdriver.By.xpath('//div[@class="js-opencorporates-additional-info"]/div/div/ul/li'));

            // Table to put officers in
            let table = {

                columns: [
                    { title: "Officer Name", key: "name", type: "Text" },
                    { title: "Role", key: "role", type: "Text" },
                    { title: "Start", key: "start", type: "Text" },
                    { title: "End", key: "end", type: "Text" }
                ],
                rows: []
            }

            // Iterate through officers
            for(let officer of officers) {
                
                let officerName = await this.driver.executeScript('var parent = arguments[0];var child = parent.firstChild; var ret = ""; while(child) { if(child.nodeType === Node.TEXT_NODE) ret += child.textContent; child = child.nextSibling; }  return ret; ', officer);
                officerName = officerName.replace(/\n/g, '');

                let roleDate = await officer.findElement(this.webdriver.By.xpath('./span')).getText();
                
                let officerRole = roleDate.split('(')[0];

                let dates = roleDate.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/g);
                let roleStart: string = '';
                let roleEnd: string = '';

                if(dates.length == 1) {
                    roleStart = dates[0];
                } else if(roleDate.length == 2) {
                    roleStart = dates[0];
                    roleEnd = dates[1];
                }

                table.rows.push({
                    name: officerName,
                    role: officerRole,
                    start: roleStart,
                    end: roleEnd
                });
            }

            
            companyFormat.companyName = companyName;
            companyFormat.companyNumber = companyNumber;
            companyFormat.address = address;
            companyFormat.incorporationDate = incorporationDate;
            companyFormat.companyStatus = companyStatus;
            companyFormat.industryCodes = inudstryCodes;
            companyFormat.officers = table;


            return this.success(`Successfully scraped company`, companyFormat);

        } catch(err) {
            return this.error(`Error scraping company`, err)
        }
    }

    // Main function called to do a complete scrape on a company
    public async search(companyNumber: string = this.query): Promise<SearchioResponse> {
        try{
            
            await this.loadSearch(companyNumber);

            let companyFormat = await this.scrapeCompany();

            return this.success(`Successfully scraped companies matching ${this.query}`, companyFormat.data);

        } catch(err) {
            return this.error(`Error scraping companies`, err);
        }
    }

}