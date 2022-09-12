import { SearchioResponse } from "../../../models/SearchioResponse";
import { WorldCatProcess } from "./WorldCatProcess";
import { SocketService } from "../../SocketService";
import { ANY } from "../../../assets/RegexPatterns";
import { WebLink } from "../../../models/WebLink";

export class WorldCatSearch extends WorldCatProcess {
    
    protected id = "WorldCatSearch";           
    protected name: "WorldCat Search";
    protected pattern: RegExp = ANY;

    public table = {

        columns: [
            { title: "Type", key: "type", type: "Text" },
            { title: "Title", key: "title", type: "Text" },
            { title: "Authors", key: "authors", type: "Text" },
            { title: "Link", key: "link", type: "WebPage" }
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
        //this.destroyWebdriver();
        return result;
    }


    // Load the search
    public async loadSearch(searchTerm: string): Promise<SearchioResponse> {
        try {
            await this.driver.get(`https://www.worldcat.org/`);

            // Wait for cookies to load
            await this.waitForElement('//button[@id="onetrust-accept-btn-handler"]', 20);

            // Accept cookies
            await this.driver.findElement(this.webdriver.By.xpath('//button[@id="onetrust-accept-btn-handler"]')).click();

            // Wait for input to load
            await this.waitForElement('//input[@class="MuiInputBase-input MuiOutlinedInput-input MuiAutocomplete-input MuiAutocomplete-inputFocused MuiInputBase-inputAdornedEnd MuiOutlinedInput-inputAdornedEnd"]', 20);

            // Input search term
            await this.driver.findElement(this.webdriver.By.xpath('//input[@class="MuiInputBase-input MuiOutlinedInput-input MuiAutocomplete-input MuiAutocomplete-inputFocused MuiInputBase-inputAdornedEnd MuiOutlinedInput-inputAdornedEnd"]')).sendKeys(searchTerm);

            // Wait for search button
            await this.pause(1500);

            // Click search button
            await this.driver.findElement(this.webdriver.By.xpath('//button[@class="MuiButtonBase-root MuiButton-root MuiButton-contained jss76 MuiButton-containedPrimary"]')).click();

            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err);
        }
    }

    // Scrape a page of results
    public async scrapePage():Promise<SearchioResponse> {

        console.log("SCRAPING PAGE");

        try{

            let results = [];

            for(let result of results) {
                let type = '';
                let title = '';
                let authors = '';
                let link = '';

                type = await result.findElement(this.webdriver.By.xpath('.//div[@class="type"]/span[@class="itemType"]')).getText();
                title = await result.findElement(this.webdriver.By.xpath('.//div[@class="name"]')).getText();
                authors = await result.findElement(this.webdriver.By.xpath('.//div[@class="author"]')).getText();
                link = await result.findElement(this.webdriver.By.xpath('.//div[@class="name"]/a')).getAttribute('href');
                

                this.table.rows.push({
                    type: type,
                    title: title,
                    link:  { text: title, url: link } as WebLink,
                    authors: authors 
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
            // Wait for results to completely load in
            await this.waitForElement('//table[@class="table-results"]', 20);

            await this.flipThrough('//button[@class="MuiButtonBase-root MuiPaginationItem-root MuiPaginationItem-page MuiPaginationItem-textPrimary" and last()]', '//table[@class="table-results"]/tbody/tr[@class="menuElem"]', this.scrapePage.bind(this), 2);

            return this.success(`Successfully scraped all pages`);

        } catch(err) {
            return this.error(`Could not scrape all pages`, err);
        }
    }

    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            await this.loadSearch(searchTerm);

            await this.scrapePages();

            return this.success(`Successfully scraped WorldCat for ${this.query}`, this.table);

        } catch(err) {
            return this.error(`Error scraping WorldCat`, err);
        }
    }

}