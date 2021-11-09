import { SearchioResponse } from "../../../models/SearchioResponse";
import { LawPagesProcess } from "./LawPagesProcess";
import { SocketService } from "../../SocketService";
import { NAMES } from "../../../assets/RegexPatterns";


export class LawPagesSearch extends LawPagesProcess {
    
    protected id = "LawPagesSearch";           
    protected name: "Law Pages Search";
    protected pattern: RegExp = NAMES;

    public table = {

        columns: [
            { title: "Date", key: "date", type: "Text" },
            { title: "Court", key: "court", type: "Text" },
            { title: "Defendant", key: "defendant", type: "Text" },
            { title: "Judge", key: "judge", type: "Text" },
            { title: "Gender", key: "gender", type: "Text" },
            { title: "Age", key: "age", type: "Text" },
            { title: "Offence", key: "offence", type: "Text" },
            { title: "Sentence", key: "sentence", type: "Text" },
            { title: "Facts", key: "facts", type: "Text" },
            { title: "Firm", key: "firm", type: "Text" },
            { title: "Lawyer", key: "lawyer", type: "Text" }
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


    // Login and load search
    public async loadSearch(name: string): Promise<SearchioResponse> {
        try {

            // Load login page
            await this.driver.get(`https://www.thelawpages.com/login.php`);

            // Enter credentials and click login
            await this.driver.findElement(this.webdriver.By.xpath('//input[@id="user"]')).sendKeys(this.credentials.login);
            await this.driver.findElement(this.webdriver.By.xpath('//input[@id="pass"]')).sendKeys(this.credentials.password);
            await this.driver.findElement(this.webdriver.By.xpath('//input[@class="submitButton"]')).click();

            // Load search page
            await this.driver.get(`https://www.thelawpages.com/court-cases/court-case-search.php?mode=3`);

            // Input search term
            await this.driver.findElement(this.webdriver.By.xpath('//div[@class="innerdiv"]/table/tbody/tr[12]/td[3]/label/input')).sendKeys(name);

            // Click search
            await this.driver.findElement(this.webdriver.By.xpath('//div[@class="innerdiv"]/table/tbody/tr[21]/td[3]/input')).click();

            return this.success(`Succesfully logged in and loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err)
        }
    }

    // Iterate through paghes and scrape table of results
    public async scrapePage(results): Promise<SearchioResponse> {
        let t = this;
        
        try{

            for(let result of results) {
                let date = await result.findElement(t.webdriver.By.xpath('./tr/td[1]')).getText();
                let court = await result.findElement(t.webdriver.By.xpath('./tr/td[2]')).getText();
                let judge = await result.findElement(t.webdriver.By.xpath('./tr/td[3]')).getText();
                let defendant = await result.findElement(t.webdriver.By.xpath('./tr/td[4]')).getText();
                let gender = await result.findElement(t.webdriver.By.xpath('./tr/td[5]')).getText();
                let age = await result.findElement(t.webdriver.By.xpath('./tr/td[6]')).getText();
                let offence = await result.findElement(t.webdriver.By.xpath('./tr/td[7]')).getText();
                let sentence = await result.findElement(t.webdriver.By.xpath('./tr/td[8]')).getText();
                let facts = await result.findElement(t.webdriver.By.xpath('./tr/td[9]')).getText();
                let firm = await result.findElement(t.webdriver.By.xpath('./tr/td[10]')).getText();
                let lawyer = await result.findElement(t.webdriver.By.xpath('./tr/td[11]')).getText();

                this.table.rows.push({
                    date: date,
                    court: court,
                    defendant: defendant,
                    judge: judge,
                    gender: gender,
                    age: age,
                    offence: offence.replace(/\n/g, '. ').trim(),
                    sentence: sentence.replace(/\n/g, '. ').trim(),
                    facts: facts,
                    firm: firm.trim(),
                    lawyer: lawyer.trim(),
                });
            }
            

            return t.success(`Successfully scraped page`);

        } catch(err) {
            return t.error(`Error scraping page`, err)
        }
    }

    // Iterate through paghes and scrape table of results
    public async scrapePages(): Promise<SearchioResponse> {
        try{

            await this.flipThrough('//a[@class="next"]', '//table[@id="myTable"]/tbody', this.scrapePage.bind(this), 5);


            return this.success(`Successfully scraped all pages`);

        } catch(err) {
            return this.error(`Error scraping all pages`, err)
        }
    }

    // Main function called to do a complete scrape on a company
    public async search(name: string = this.query): Promise<SearchioResponse> {
        try{
            
            await this.loadSearch(name);

            await this.scrapePages();

            return this.success(`Successfully searched LawPages for ${this.query}`, this.table);

        } catch(err) {
            return this.error(`Error searching LawPages`, err);
        }
    }

}