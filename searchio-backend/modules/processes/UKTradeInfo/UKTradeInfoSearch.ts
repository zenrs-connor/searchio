import { SearchioResponse } from "../../../models/SearchioResponse";
import { SocketService } from "../../SocketService";
import { BUSINESS } from "../../../assets/RegexPatterns";
import { UKTradeInfoProcess } from "./UKTradeInfoProcess";


export class UKTradeInfoSearch extends UKTradeInfoProcess {
    
    protected id = "UKTradeInfoSearch";           
    protected name: "UK Trade Info Search";
    protected pattern: RegExp = BUSINESS;

    public table = {

        columns: [
            { title: "Traders", key: "traders", type: "Text" },
            { title: "Link", key: "link", type: "Text" }
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
            await this.driver.get(`https://www.uktradeinfo.com/search/traders/`);

            // Wait for element on name page to load
            await this.waitForElement('//input[@class="gem-c-search__item gem-c-search__input"]', 15);
            
            // Input the search term
            await this.driver.findElement(this.webdriver.By.xpath('//input[@class="gem-c-search__item gem-c-search__input"]')).sendKeys(searchTerm);
            
            // Click search
            await this.driver.findElement(this.webdriver.By.xpath('//button[@class="gem-c-search__submit"]')).click();
            
            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err);
        }
    }

    // Function to scrape traders
    public async scrapeTraders(traders): Promise<SearchioResponse> {
        
        const t = this;

        try {
                        
            // Iterate through the tradaers on this page and strip out name/link associated with each one
            for(let trader of traders){
                
                let traderName = await trader.findElement(t.webdriver.By.xpath('./a')).getText();
                let link = await trader.findElement(t.webdriver.By.xpath('./a')).getAttribute('href');

                this.table.rows.push({
                    traders: traderName,
                    link: link
                });
                                
            }

            return this.success(`Successfully scraped entities on this page`);

        } catch(err) {
            return this.error(`Error scraping entities on this page`, err);
        }
    }

    // Re-define function as behaves different
    public async flipThrough(nextXPath: string, collectElements: string, process: Function, pageLimit: number = 100): Promise<SearchioResponse> {

        let pages: number = 0;
        let processComplete = false;
        let results: any[] = [];

        const t = this;

        async function iterate() {
            pages++;

            let eles = await t.driver.findElements(t.webdriver.By.xpath(collectElements));

            let proc = await process(eles);
            results = results.concat(proc.data);

            if (pages >= pageLimit){
                return;
            }

            await t.scrollToBottom(2);

            let button = await t.driver.findElements(t.webdriver.By.xpath(nextXPath));
    
            if(button.length > 0) {
                await t.driver.findElement(t.webdriver.By.xpath(nextXPath)).click();
            } else {
                return;
            }

            return iterate();
        }

        try {

            let finalResponse = await iterate();

            return this.success(`Flipped though ${pages} pages`, results);

        } catch(err) {
            return this.error(`Could not flip through pages`, err);
        }
        

    }


    // Function to call flipThrough and scrape results
    public async scrapePages(): Promise<SearchioResponse> {
        try {
            // Check we have some results
            await this.waitForElement('//ol[@class="govuk-list app-search-results"]', 15);

            await this.flipThrough('//a[@aria-label="Next page"]', '//ol[@class="govuk-list app-search-results"]/li', this.scrapeTraders.bind(this), 5);

            return this.success(`Successfully scraped traders`);
            
        } catch(err) {
            return this.error(`Error scraping Insolvency Service`, err);
        }
    }

    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            await this.loadSearch(searchTerm);

            let x = await this.scrapePages();
            console.log(x)

            await this.pause(15000);

            return this.success(`Successfully performed UK Trade Info search`, this.table);

        } catch(err) {
            return this.error(`Error searching UK Trade Info`, err);
        }
    }

}