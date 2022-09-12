import { SearchioResponse } from "../../../models/SearchioResponse";
import { GoogleScholarProcess } from "./GoogleScholarProcess";
import { SocketService } from "../../SocketService";
import { ANY } from "../../../assets/RegexPatterns";
import { WebLink } from "../../../models/WebLink";
import { ResultData } from "../../../models/ResultData";


export class GoogleScholarSearch extends GoogleScholarProcess {
    
    protected id = "GoogleScholarSearch";           
    protected name: string = "Search";
    protected pattern: RegExp = ANY;

    public table = {

        columns: [
            { title: "Title", key: "title", type: "WebLink" },
            { title: "Snippet", key: "snippet", type: "Text" },
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
        this.initWebdriver();
        let result = await this.search();
        this.destroyWebdriver();
        return result;
    }


    // Load the search
    public async loadSearch(searchTerm: string): Promise<SearchioResponse> {
        try {
            await this.driver.get(`https://scholar.google.com/`);

            // Input search term
            await this.driver.findElement(this.webdriver.By.xpath('//input[@name="q"]')).sendKeys(searchTerm);

            // Wait for search button
            await this.pause(1500);

            // Click search button
            await this.driver.findElement(this.webdriver.By.xpath('//button[@name="btnG"]')).click();

            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err);
        }
    }

    // Scrape a page of results
    public async scrapePage(results):Promise<SearchioResponse> {
        
        const t = this;

        try{
           
            for(let result of results) {
                let link = '';
                let title = '';
                let snippet = '';

                link = await result.findElement(this.webdriver.By.xpath('.//h3[@class="gs_rt"]/a')).getAttribute('href');
                title = await result.findElement(this.webdriver.By.xpath('.//h3[@class="gs_rt"]/a')).getText();
                snippet = await result.findElement(this.webdriver.By.xpath('.//div[@class="gs_rs"]')).getText();

                this.table.rows.push({
                    title:  { text: title, url: link } as WebLink,
                    snippet: snippet 
                });
            }

            return this.success(`Successfully scraped page of results`);

        } catch(err) {
            return this.error(`Error scraping page of results`, err)
        }
    }

    // Scrape set number of pages
    public async scrapePages():Promise<SearchioResponse> {
        try {
            
            await this.waitForElement('//div[@id="gs_res_ccl"]', 20);

            await this.flipThrough('//button[@class="gs_btnPR gs_in_ib gs_btn_lrge gs_btn_half gs_btn_lsu"]', '//div[@class="gs_r gs_or gs_scl"]', this.scrapePage.bind(this), 4);

            return this.success(`Successfully scraped all pages`);

        } catch(err) {
            return this.error(`Could not scrape all pages`, err);
        }
    }

    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            // This script behaves differently dependant on whether or not the window is full screen
            // Class names and other identifiers change
            await this.loadSearch(searchTerm);

            await this.scrapePages();

            let results: ResultData[] = [];
            if(this.table.rows.length > 0) {
                results = [{
                    name: "Search Results",
                    type: "Table",
                    data: this.table
                }]
            }

            return this.success(`Successfully scraped GoogleScholar for ${this.query}`, results);

        } catch(err) {
            return this.error(`Error scraping GoogleScholar`, err);
        }
    }

}