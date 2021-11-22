import { SearchioResponse } from "../../../models/SearchioResponse";
import { OpenOwnershipProcess } from "./OpenOwnershipProcess";
import { SocketService } from "../../SocketService";
import { BUSINESS } from "../../../assets/RegexPatterns";


const request = require('request');

export class OpenOwnershipCompaniesSearch extends OpenOwnershipProcess {
    
    protected id = "OpenOwnershipCompaniesSearch";           
    protected name: "Companies Search";
    protected pattern: RegExp = BUSINESS;

    public table = {

        columns: [
            { title: "Name", key: "name", type: "Text" },
            { title: "Jurisdiction and Date's", key: "jurisdictionDate", type: "Text" },
            { title: "Address", key: "address", type: "Text" }
        ],
        rows: []
    }
    
    
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


    // Load the search
    public async loadSearch(company: string): Promise<SearchioResponse> {
        try {
            company = company.replace(' ', '+');
            await this.driver.get(`https://register.openownership.org/search?utf8=%E2%9C%93&q=${company}`);

            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err)
        }
    }

    // Scrape a single page of company results
    public async scrapePage(companies: any):Promise<SearchioResponse> {
        try{
            const t = this;

            for(let company of companies) {
                let check = await company.findElements(t.webdriver.By.xpath('.//div[@class="type-icon legal-entity"]'));
                if(check.length > 0) {
                    let nameElement = await company.findElement(t.webdriver.By.xpath('./div/div/a'));
                    let name = await t.driver.executeScript('var parent = arguments[0];var child = parent.firstChild; var ret = ""; while(child) { if(child.nodeType === Node.TEXT_NODE) ret += child.textContent; child = child.nextSibling; }  return ret; ', nameElement);

                    let jurisdictionDate = await company.findElement(t.webdriver.By.xpath('./div/div/a/small')).getAttribute('innerHTML');
                    jurisdictionDate = jurisdictionDate.replace('\n', '');
                    jurisdictionDate = jurisdictionDate.split('<br>');

                    this.table.rows.push({
                        name: name.replace(/\n/g, ''),
                        jurisdictionDate: jurisdictionDate[0].replace(/\n/g, ''),
                        address: jurisdictionDate[1].replace(/\n/g, '')
                    });
                } else {
                    console.log("This is not a company");
                }
            }
            
            return t.success(`Successfully scraped page of companies`);

        } catch(err) {
            return this.error(`Error scraping page of companies`, err)
        }
    }

    // Function to scrape a set number of pages results
    public async scrapeCompanies(): Promise<SearchioResponse> {
        try{
            let x = await this.flipThrough('//span[@class="next"]/a', '//ul[@class="list-unstyled list-entities"]/li', this.scrapePage.bind(this), 5);
            console.log(x);
            

            return this.success(`Successfully scraped all companies`);

        } catch(err) {
            return this.error(`Error scraping companies`, err)
        }
    }

    // Main function called to scrape companies
    public async search(company: string = this.query): Promise<SearchioResponse> {
        try{
            
            await this.loadSearch(company);

            await this.scrapeCompanies();

            return this.success(`Successfully scraped companies matching ${this.query}`, this.table);

        } catch(err) {
            return this.error(`Error scraping companies`, err);
        }
    }

}