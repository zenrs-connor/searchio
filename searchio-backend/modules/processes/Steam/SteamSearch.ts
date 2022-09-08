import { SearchioResponse } from "../../../models/SearchioResponse";
import { SocketService } from "../../SocketService";
import { ANY } from "../../../assets/RegexPatterns";
import { SteamProcess } from "./SteamProcess";
import { WebElement } from "selenium-webdriver";
import { ResultData } from "../../../models/ResultData";


export class SteamSearch extends SteamProcess {
    
    protected id = "SteamSearch";
    protected name: string = "Search";
    protected pattern: RegExp = ANY;
    
    public table = {

        columns: [
            { title: "Name", key: "name", type: "Text" },
            { title: "Image", key: "image", type: "Image" },
            { title: "Link", key: "link", type: "WebLink" },
            { title: "Description", key: "description", type: "Text" },
            { title: "Other", key: "other", type: "Text" },
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
    public async loadSearch(searchTerm: string = this.query): Promise<SearchioResponse> {
        try {
            searchTerm = searchTerm.replace(' ', '+');
            await this.driver.get(`https://steamcommunity.com/search/users/#text=${searchTerm}`);
            
            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err);
        }
    }

    // Function called by flipThrough to strip out details of row
    public async scrapeRows(elements: WebElement[]): Promise<SearchioResponse> {

        try {
            let results = [];
            const t = this;
            for(let element of elements) {

                let SteamResult: {   
                    name: string,
                    image: string,
                    link: any,
                    description: string,
                    other: string
                } = {
                    name: '',
                    image: '',
                    link: { text: '', url: '' },
                    description: '',
                    other: ''
                };

                let name = await element.findElement(t.webdriver.By.xpath('.//div[@class="searchPersonaInfo"]/a[@class="searchPersonaName"]')).getText();
                let img = await element.findElement(t.webdriver.By.xpath('.//div[@class="avatarMedium"]/a/img')).getAttribute('src');
                let link = await element.findElement(t.webdriver.By.xpath('.//div[@class="searchPersonaInfo"]/a[@class="searchPersonaName"]')).getAttribute('href');
                let desc = await element.findElement(t.webdriver.By.xpath('.//div[@class="searchPersonaInfo"]')).getText();
                let other = await element.findElements(t.webdriver.By.xpath('.//div[@class="search_match_info"]'));

                if(name) SteamResult.name = name;
                if(img) SteamResult.image = img;
                if(link) SteamResult.link = { text: link, url: link };
                if(desc) SteamResult.description = desc;



                if(other.length > 0){
                    other = await element.findElement(t.webdriver.By.xpath('.//div[@class="search_match_info"]')).getText();
                    if(other) SteamResult.other = other;
                }

                this.table.rows.push(SteamResult as any);

            }
    
            return this.success(`Successfully scraped rows`, results);
            

        } catch(err) {
            return this.error(`Error attempting to scrape rows`, err);
        }
    }

    // Re-define function to iterate through pages, perform a given processon all collected elements when also given the xpath for the next button
    public async flipThrough(nextXPath: string, collectElements: string, process: Function, pageLimit: number = 100): Promise<SearchioResponse> {

        let pages: number = 0;
        let results: any[] = [];

        const t = this;

        async function iterate() {
            pages++;

            await t.waitForElement('//div[@id="search_results"]', 10);

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

    // Function to look at results
    public async scrapeResult(): Promise<SearchioResponse> {

        try {

            await this.waitForElement('//div[@id="search_results"]', 10);

            // Check that there are no errors
            let check = await this.driver.findElements(this.webdriver.By.xpath('//div[@class="search_results_error"]'));

            if(check.length > 0) {
                return this.error(`No results on Steam for that search term`);
            } else {
                let results = await this.flipThrough('//span[text()=">"]', '//div[@class="search_row"]', this.scrapeRows.bind(this), 7);
    
                return this.success(`Successfully scraped Steam results`, results.data);    
            }

        } catch(err) {
            return this.error(`Error attempting to results from Steam`, err);
        }
    }

    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            await this.loadSearch(searchTerm);

            await this.scrapeResult();

            await this.pause(5000);

            let results: ResultData[] = [];

            if(this.table.rows.length > 0) {
                results = [{
                    name: `Steam Accounts Matching "${ this.query }"`,
                    type: "Table",
                    data: this.table
                }];
            }

            return this.success(`Successfully preformed search on Steam`, results);

        } catch(err) {
            return this.error(`Error performing search on Steam`, err);
        }
    }

}