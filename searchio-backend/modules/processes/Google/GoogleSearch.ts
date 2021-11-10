import { SearchioResponse } from "../../../models/SearchioResponse";
import { GoogleProcess } from "./GoogleProcess";
import { SocketService } from "../../SocketService";
import { BUSINESS } from "../../../assets/RegexPatterns";


export class GoogleSearch extends GoogleProcess {
    
    protected id = "GoogleSearch";           
    protected name: "Google Search";
    protected pattern: RegExp = BUSINESS;

    public table = {

        columns: [
            { title: "Type", key: "type", type: "Text" },
            { title: "Title", key: "title", type: "Text" },
            { title: "Snippet", key: "snippet", type: "Text" },
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
    public async loadSearch(searchTerm: string): Promise<SearchioResponse> {
        try {
            await this.driver.get(`https://www.google.com/`);

            // Accept cookies
            await this.driver.findElement(this.webdriver.By.xpath('//button[@id="L2AGLb"]')).click();

            // Input search term
            await this.driver.findElement(this.webdriver.By.xpath('//input[@class="gLFyf gsfi"]')).sendKeys(searchTerm);

            // Click search button
            await this.driver.findElement(this.webdriver.By.xpath('//div[@class="FPdoLc lJ9FBc"]/center/input')).click();

            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err)
        }
    }

    // Scrape a single page of results
    public async scrapePage():Promise<SearchioResponse> {
        try{
            // Normal results
            let normalResults = await this.driver.findElements(this.webdriver.By.xpath('//div[@class="tF2Cxc"]'));
            for(let result of normalResults) {
                let title = await result.findElement(this.webdriver.By.xpath('./div/a')).getAttribute('href');
                let link = await result.findElement(this.webdriver.By.xpath('./div/a/h3')).getText();
                let snippet = await result.findElement(this.webdriver.By.xpath('./div[2]')).getText();

                this.table.rows.push({
                    type: 'Webpage',
                    title: title,
                    link: link,
                    snippet: snippet 
                });
            }

            // Videos results
            let videoResults = await this.driver.findElements(this.webdriver.By.xpath('//div[@class="EoYlye"]'));
            for(let result of videoResults) {
                let title = await result.findElement(this.webdriver.By.xpath('.//div[@class="w18VHb YVgRyb oz3cqf p5AXld"]')).getText();
                let link = await result.findElement(this.webdriver.By.xpath('./a')).getAttribute('href');

                this.table.rows.push({
                    type: 'Video',
                    title: title,
                    link: link,
                    snippet: '' 
                });
            }

            // Youtube account results
            videoResults = await this.driver.findElements(this.webdriver.By.xpath('//div[@class="d3zsgb"]'));
            for(let result of videoResults) {
                let title = await result.findElement(this.webdriver.By.xpath('./div/a/h3')).getText();
                let link = await result.findElement(this.webdriver.By.xpath('./div/a')).getAttribute('href');

                this.table.rows.push({
                    type: 'Video',
                    title: title,
                    link: link,
                    snippet: '' 
                });
            }

            // Video results
            videoResults = await this.driver.findElements(this.webdriver.By.xpath('//div[@class="RzdJxc"]'));
            for(let result of videoResults) {
                let title = await result.findElement(this.webdriver.By.xpath('.//div[@class="fc9yUc oz3cqf p5AXld"]')).getText();
                let link = await result.findElement(this.webdriver.By.xpath('.//a[@class="X5OiLe"]')).getAttribute('href');

                this.table.rows.push({
                    type: 'Video',
                    title: title,
                    link: link,
                    snippet: '' 
                });
            }

            // Article results
            let articleResults = await this.driver.findElements(this.webdriver.By.xpath('//div[@class="JJZKK yLWA8b"]'));
            for(let result of articleResults) {
                let title = await result.findElement(this.webdriver.By.xpath('.//div[@class="mCBkyc tNxQIb ynAwRc oz3cqf nDgy9d"]')).getText();
                let link = await result.findElement(this.webdriver.By.xpath('.//a[@class="WlydOe"]')).getAttribute('href');

                this.table.rows.push({
                    type: 'Article',
                    title: title,
                    link: link,
                    snippet: '' 
                });
            }

            // Article results
            articleResults = await this.driver.findElements(this.webdriver.By.xpath('//div[@class="JJZKK"]'));
            for(let result of articleResults) {
                let title = await result.findElement(this.webdriver.By.xpath('.//div[@class="mCBkyc tNxQIb ynAwRc oz3cqf nDgy9d"]')).getText();
                let link = await result.findElement(this.webdriver.By.xpath('.//a[@class="WlydOe"]')).getAttribute('href');

                this.table.rows.push({
                    type: 'Article',
                    title: title,
                    link: link,
                    snippet: '' 
                });
            }

            // Article results
            articleResults = await this.driver.findElements(this.webdriver.By.xpath('//a[@class="WlydOe"]'));
            for(let result of articleResults) {
                let title = await result.findElement(this.webdriver.By.xpath('./div/div[2]/div[2]')).getText();
                let link = await result.getAttribute('href');

                this.table.rows.push({
                    type: 'Article',
                    title: title,
                    link: link,
                    snippet: '' 
                });
            }

            // Tweet results
            let tweetResults = await this.driver.findElements(this.webdriver.By.xpath('//div[@class="dHOsHb nlkcvc"]'));
            for(let result of tweetResults) {
                let title = await result.findElement(this.webdriver.By.xpath('.//div[@class="xcQxib eadHV NdbWE YBEXSb"]')).getText();
                let link = await result.findElement(this.webdriver.By.xpath('.//a[@class="h4kbcd"]')).getAttribute('href');

                this.table.rows.push({
                    type: 'Tweet',
                    title: title,
                    link: link,
                    snippet: '' 
                });
            }
            
            return this.success(`Successfully scraped page of results`);

        } catch(err) {
            return this.error(`Error scraping page of results`, err)
        }
    }

    // Main function called to scrape companies
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            
            await this.loadSearch(searchTerm);

            let x = await this.scrapePage();
            console.log(x);

            await this.pause(10000);

            return this.success(`Successfully scraped Google for ${this.query}`, this.table);

        } catch(err) {
            return this.error(`Error scraping Google`, err);
        }
    }

}