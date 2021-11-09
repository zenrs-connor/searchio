import { SearchioResponse } from "../../../models/SearchioResponse";
import { OpenOwnershipProcess } from "./OpenOwnershipProcess";
import { SocketService } from "../../SocketService";
import { BUSINESS } from "../../../assets/RegexPatterns";


const request = require('request');

export class OpenOwnershipOfficersSearch extends OpenOwnershipProcess {
    
    protected id = "OpenOwnershipOfficersSearch";           
    protected name: "Officers Search";
    protected pattern: RegExp = BUSINESS;

    public table = {

        columns: [
            { title: "Name", key: "name", type: "Text" },
            { title: "Date of Birth", key: "dob", type: "Text" },
            { title: "Nationality", key: "nationality", type: "Text" },
            { title: "Address", key: "address", type: "Text" },
            { title: "Companies", key: "companies", type: "Text" }
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
    public async loadSearch(officer: string): Promise<SearchioResponse> {
        try {
            officer = officer.replace(' ', '+');
            await this.driver.get(`https://register.openownership.org/search?utf8=%E2%9C%93&q=${officer}&type=natural-person`);

            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err)
        }
    }

    // Scrape a single page of company results
    public async scrapePage(officers: any):Promise<SearchioResponse> {
        try{
            const t = this;

            for(let officer of officers) {
                
                // Getting name
                let nameElement = await officer.findElement(t.webdriver.By.xpath('./div/div/a'));
                let name = await t.driver.executeScript('var parent = arguments[0];var child = parent.firstChild; var ret = ""; while(child) { if(child.nodeType === Node.TEXT_NODE) ret += child.textContent; child = child.nextSibling; }  return ret; ', nameElement);

                // Get text that contains nationality, DOB and anddress
                let text = await officer.findElement(t.webdriver.By.xpath('./div/div/a/small')).getAttribute('innerHTML');
                text = text.replace('\n', '');
                text = text.split('<br>');
                
                // Extract address from element text
                let address = text[1].replace(/\n/g, '');
                
                // Extract DOB from element text
                let dob = text[0].split('Born ')[1];
                dob = dob.split(')')[0];

                // Extract nationality from element text
                let nationality = text[0].split('(')[0];

                // Get the companies
                let companyList: string[] = [];
                let companies = await officer.findElements(t.webdriver.By.xpath('.//div[@class="result-controls"]/a'));
                for(let company of companies) {
                    let companyName = await company.getText();
                    companyList.push(companyName);
                }

                
                this.table.rows.push({
                    name: name.replace(/\n/g, ''),
                    dob: dob.replace(/\n/g, ''),
                    nationality: nationality.replace(/\n/g, ''),
                    address: address.replace(/\n/g, ''),
                    companies: companyList
                });
                
            }
            
            return t.success(`Successfully scraped page of officers`);

        } catch(err) {
            return this.error(`Error scraping page of officers`, err)
        }
    }

    // Function to scrape a set number of pages results
    public async scrapeOfficers(): Promise<SearchioResponse> {
        try{
            await this.flipThrough('//span[@class="next"]/a', '//ul[@class="list-unstyled list-entities"]/li', this.scrapePage.bind(this), 5);
            
            return this.success(`Successfully scraped all officers`);

        } catch(err) {
            return this.error(`Error scraping officers`, err)
        }
    }

    // Main function called to scrape companies
    public async search(officer: string = this.query): Promise<SearchioResponse> {
        try{
            
            await this.loadSearch(officer);

            await this.scrapeOfficers();

            return this.success(`Successfully scraped officers matching ${this.query}`, this.table);

        } catch(err) {
            return this.error(`Error scraping officers`, err);
        }
    }

}