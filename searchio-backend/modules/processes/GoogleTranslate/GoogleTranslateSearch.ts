import { SearchioResponse } from "../../../models/SearchioResponse";
import { GoogleTranslateProcess } from "./GoogleTranslateProcess";
import { SocketService } from "../../SocketService";
import { ANY } from "../../../assets/RegexPatterns";
import { WebLink } from "../../../models/WebLink";
import { ResultData } from "../../../models/ResultData";

export class GoogleTranslateSearch extends GoogleTranslateProcess {
    
    protected id = "GoogleTranslateSearch";           
    protected name: string = "Translate";
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
        this.initWebdriver();
        let result = await this.search();
        this.destroyWebdriver();
        return result;
    }


    // Load the search
    public async loadSearch(searchTerm: string): Promise<SearchioResponse> {
        try {
            await this.driver.get(`https://translate.google.co.uk/`);

            // Wait for cookies to load
            await this.waitForElement("//button/span[contains(text(), 'Accept all')]", 20);

            console.log("CLICKING");

            // Accept cookies
            await this.driver.findElement(this.webdriver.By.xpath("//button/span[contains(text(), 'Accept all')]")).click();

            // Wait for page to load
            await this.waitForElement('//div[@class="WFnNle"]', 20);

            // Input search term
            await this.driver.findElement(this.webdriver.By.xpath('//textarea[@class="er8xn"]')).sendKeys(searchTerm);

            return this.success(`Successfully input text to be translated`);

        } catch(err) {
            return this.error(`Error inputting text to be translated`, err);
        }
    }

    // Scrape set number of pages
    public async translate():Promise<SearchioResponse> {
        try {

            let result: {   
                input: string, 
                languageDetected?: string,
                output?: string
            } = {
                input: this.query
            };

            // Wait for results to completely load in
            await this.waitForElement('//div[@class="dePhmb"]/div[@class="eyKpYb"]/div[@class="J0lOec"]/span[@class="VIiyi"]/span/span', 20);

            let detectedLanguage = await this.driver.findElement(this.webdriver.By.xpath('//span[@class="VfPpkd-jY41G-V67aGc"][contains(text(), "detected")]')).getText();
            let translation = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="dePhmb"]/div[@class="eyKpYb"]/div[@class="J0lOec"]/span[@class="VIiyi"]/span/span')).getText();
            detectedLanguage = detectedLanguage.replace(' - DETECTED', '');

            result.languageDetected = detectedLanguage;
            result.output = translation;

            return this.success(`Successfully scraped translation`, result);

        } catch(err) {
            return this.error(`Could not scrape translation`, err);
        }
    }

    // Main function called to perform search for translation
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            await this.loadSearch(searchTerm);

            let result = await this.translate();


            let results: ResultData[] = [
                { name: "Input", type: "Text", data: result.data.input},
                { name: "Language Detected", type: "Text", data: result.data.languageDetected },
                { name: "Output", type: "Text", data: result.data.output },
            ]

            return this.success(`Successfully translated ${this.query} using Google translate`, results);

        } catch(err) {
            return this.error(`Error translating using Google`, err);
        }
    }

}