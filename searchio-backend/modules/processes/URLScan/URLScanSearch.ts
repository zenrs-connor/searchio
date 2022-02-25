import { SearchioResponse } from "../../../models/SearchioResponse";
import { SocketService } from "../../SocketService";
import { ANY } from "../../../assets/RegexPatterns";
import { URLScanProcess } from "./URLScanProcess";


export class URLScanSearch extends URLScanProcess {
    
    protected id = "URLScanSearch";
    protected name: "URL Scan Search";
    protected pattern: RegExp = ANY;
    
    
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
            await this.driver.get(`https://urlscan.io/`);

            // Wait for element to load
            await this.waitForElement('//div[@class="input-group"]/input', 15);
            
            // Input the search term
            await this.driver.findElement(this.webdriver.By.xpath('//div[@class="input-group"]/input')).sendKeys(searchTerm);
            
            // Click search
            await this.driver.findElement(this.webdriver.By.xpath('//button[@id="submitbtn"]')).click();
            
            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err);
        }
    }

    // Function to look at results
    public async scrapeResult(): Promise<SearchioResponse> {

        try {
            // Wait for result to load in
            await this.waitForElement('//div[@class="main content"]', 60);
            
            // Check result element is present
            // await this.waitForElement('//h1[@class="top break-all small"]/small', 60);
            // let ip = await this.driver.findElement(this.webdriver.By.xpath('//h1[@class="top break-all small"]/small')).getText();
            // console.log(ip);
            await this.waitForElement('//div[@class="panel panel-default"]', 60);
            let summary = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="panel panel-default"]')).getText();
            summary = summary.split('\n')[0];


            return this.success(`Successfully retrieved URL Scan results`, summary);

        } catch(err) {
            return this.error(`Error scraping URL Scan results`, err);
        }
    }

    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            await this.loadSearch(searchTerm);

            let scrape = await this.scrapeResult();

            await this.pause(5000);

            return this.success(`Successfully performed search on URL Scan`, scrape.data);

        } catch(err) {
            return this.error(`Error searching URL Scan`, err);
        }
    }

}