import { SearchioResponse } from "../../../models/SearchioResponse";
import { FCAProcess } from "./FCAProcess";
import { SocketService } from "../../SocketService";
import { BUSINESS } from "../../../assets/RegexPatterns";


export class FCAIndividualSearch extends FCAProcess {
    
    protected id = "FCAIndividualSearch";           
    protected name: "FCA Individual Search";
    protected pattern: RegExp = BUSINESS;

    public table = {

        columns: [
            { title: "Name", key: "name", type: "Text" },
            { title: "Reference Number", key: "refNumber", type: "Text" },
            { title: "Known Names", key: "knownNames", type: "Text" },
            { title: "Previous Names", key: "prevNames", type: "Text" },
            { title: "Connected To", key: "connectedTo", type: "Text" }
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

            // Get search term ready to be inputted into URL
            searchTerm = searchTerm.replace(' ', '%20')
            await this.driver.get(`https://register.fca.org.uk/s/search?q=${searchTerm}&type=Individuals`);

            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err);
        }
    }

    // Function to scrape company
    public async scrapeIndividuals(individuals): Promise<SearchioResponse> {
        
        const t = this;

        try {
            
            for(let individual of individuals) {

                let name = await individual.findElement(t.webdriver.By.xpath('.//a[@class="text-link text-link_default"]')).getText();
                let refNumber = await individual.findElement(t.webdriver.By.xpath('.//div[@class="text-medium slds-text-color_weak"]')).getText();
                refNumber = refNumber.replace('Reference number: ', '')

                let knownAs = '';
                let prevNames = '';
                let otherElements = await individual.findElements(t.webdriver.By.xpath('.//div[@class="stack stack--direct stack--small result-card_figure-offset"]/div'));
                for(let otherElement of otherElements) {
                    
                    let text = await otherElement.getText();
                    
                    if(text.includes('Known as')) {
                        text = text.replace('Known as\n','');
                        knownAs = text;
                    } else if (text.includes('Previous Names')) {
                        text = text.replace('Previous Names\n','');
                        prevNames = text;
                    }
                }

                let connectedTo = [];
                let connections = await individual.findElements(t.webdriver.By.xpath('.//div[@class="result-card_content"]/div/div/div[@class="stack stack--direct stack--x-small"]/ul/li'));
                for(let connection of connections) {
                    let text = await connection.getText();
                    connectedTo.push(text)
                }

                this.table.rows.push({
                    name: name,
                    refNumber: refNumber,
                    knownNames: knownAs,
                    prevNames: prevNames,
                    connectedTo: connectedTo
                });
                
                
            }
            

            return this.success(`Successfully scraped companies`);

        } catch(err) {
            return this.error(`Error scraping companies`, err);
        }
    }

    // Re-define function as behaves differently
    public async flipThrough(nextXPath: string, collectElements: string, process: Function, pageLimit: number = 100): Promise<SearchioResponse> {

        let pages: number = 0;
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

            let button = await t.driver.findElements(t.webdriver.By.xpath(nextXPath));
    
            if(button.length > 0) {
                let buttonCheck = await t.driver.findElement(t.webdriver.By.xpath(nextXPath)).isEnabled();
                if(buttonCheck == true) {
                    await t.driver.findElement(t.webdriver.By.xpath(nextXPath)).click();
                    await t.pause(2500);
                    await t.waitForElement('//ol[@class="results individual-results stack stack--direct stack--x-small "]', 15);
                } else {
                    return
                }
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

    // Function to call flipThrough and scrape individuals
    public async scrapePages(): Promise<SearchioResponse> {
        try {

            // Wait for next button to appear
            await this.waitForElement('//button[@id="-pagination-next-btn"]', 15);
            
            await this.flipThrough('//button[@id="-pagination-next-btn"]', '//ol[@class="results individual-results stack stack--direct stack--x-small "]/li', this.scrapeIndividuals.bind(this), 1);

            return this.success(`Successfully scraped individuals`);

        } catch(err) {
            return this.error(`Error scraping individuals`, err);
        }
    }

    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            await this.loadSearch(searchTerm);
            
            await this.scrapePages();

            await this.pause(15000);

            return this.success(`Successfully performed FCA individual search`, this.table);

        } catch(err) {
            return this.error(`Error searching FCA for individuals`, err);
        }
    }

}