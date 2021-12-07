import { SearchioResponse } from "../../../models/SearchioResponse";
import { CharityCommissionProcess } from "./CharityCommissionProcess";
import { SocketService } from "../../SocketService";
import { ANY } from "../../../assets/RegexPatterns";
import { WebLink } from "../../../models/WebLink";

export class CharityCommissionSearch extends CharityCommissionProcess {
    
    protected id = "CharityCommissionSearch";           
    protected name: "Charity Commission Search";
    protected pattern: RegExp = ANY;

    public table = {

        columns: [
            { title: "Charity Number", key: "charityNumber", type: "Webpage" },
            { title: "Charity Name", key: "charityName", type: "Webpage" },
            { title: "Status", key: "status", type: "Text" },
            { title: "Income", key: "income", type: "Text" },
            { title: "Reporting", key: "reporting", type: "Text" }
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
    public async loadSearch(searchTerm: string = this.query): Promise<SearchioResponse> {
        try {
            await this.driver.get(`https://register-of-charities.charitycommission.gov.uk/charity-search`);

            // Wait for cookies to load
            await this.waitForElement('//a[@class="btn btn-primary btn-cookie-consent govuk-button"]', 20);

            // Accept cookies
            await this.driver.findElement(this.webdriver.By.xpath('//a[@class="btn btn-primary btn-cookie-consent govuk-button"]')).click();

            // Wait for input to load
            await this.waitForElement('//input[@class="govuk-input"]', 20);

            // Input search term
            await this.driver.findElement(this.webdriver.By.xpath('//input[@class="govuk-input"]')).sendKeys(searchTerm);

            // Wait for search button to load
            await this.waitForElement('//button[@class="govuk-button"]', 20);

            // Click search button
            await this.driver.findElement(this.webdriver.By.xpath('//button[@class="govuk-button"]')).click();

            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err);
        }
    }

    // Function called to actually scrape and store all charities in table
    public async scrapePage(results):Promise<SearchioResponse> {

        try{

            const t = this;

            for(let result of results) {

                let charityNumber = '';
                let charityName = '';
                let status = '';
                let income = '';
                let reporting = '';

                let link = await result.findElement(t.webdriver.By.xpath('.//td[@class="table-cell govuk-table__cell first"]/a')).getAttribute('href');
                charityNumber = await result.findElement(t.webdriver.By.xpath('.//td[@class="table-cell govuk-table__cell first"]/a')).getText();
                charityName = await result.findElement(t.webdriver.By.xpath('.//td[2]/a')).getText();
                status = await result.findElement(t.webdriver.By.xpath('.//td[3]')).getText();
                income = await result.findElement(t.webdriver.By.xpath('.//td[4]')).getText();
                reporting = await result.findElement(t.webdriver.By.xpath('.//td[5]')).getText();
                

                this.table.rows.push({
                    charityNumber: { text: charityNumber, url: link } as WebLink,
                    charityName: { text: charityName, url: link } as WebLink,
                    status: status,
                    income: income,
                    reporting: reporting
                });
            }

            return this.success(`Successfully scraped page of results`);

        } catch(err) {
            return this.error(`Error scraping page of results`, err)
        }
    }

    // Scrape the table of all charities that appeared in the search for given search term
    public async scrapeCharities():Promise<SearchioResponse> {

        try {
            await this.waitForElement('//ul[@class="pagination"]', 15);
            await this.flipThrough('//span[@title="Next Page"]/..', '//tbody[@class="table-data"]/tr[@class=" govuk-table__row  "]', this.scrapePage.bind(this), 2);
            
            return this.success(`Successfully scraped charities`);

        } catch(err) {
            return this.error(`Could not scrape charities`, err);
        }

    }


    // When given a specific charity number, will do a more in depth scrape of the information available on an individual charity
    public async scrapeCharity():Promise<SearchioResponse> {

        try {
            // Wait for results to search
            await this.waitForElement('//tbody[@class="table-data"]', 20);
            // Click the first link
            await this.driver.findElement(this.webdriver.By.xpath('//tbody[@class="table-data"]/tr[@class=" govuk-table__row  "]/td/a')).click();

            // Wait for chairty page to load
            await this.waitForElement('//div[@class="container-fluid onereg__container"]', 20);
            


            return this.success(`Successfully scraped charity`);

        } catch(err) {
            return this.error(`Could not scrape charity`, err);
        }

    }



    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            await this.loadSearch();

            if(/^[0-9]{4,}$/.test(searchTerm) == true){
                let x = await this.scrapeCharity();
                console.log(x)
                await this.pause(50000);
                return this.success(`Successfully scraped Charity Commission`, 'PLA');

            } else {
                let x = await this.scrapeCharities();
                console.log(x);
                await this.pause(10000);
                return this.success(`Successfully scraped Charity Commission`, this.table);
            }

        } catch(err) {
            return this.error(`Error searching Charity Commission`, err);
        }
    }

}