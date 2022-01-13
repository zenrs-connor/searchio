import { SearchioResponse } from "../../../models/SearchioResponse";
import { EmploymentTribunalsProcess } from "./EmploymentTribunalsProcess";
import { SocketService } from "../../SocketService";
import { ANY } from "../../../assets/RegexPatterns";


export class EmploymentTribunalsSearch extends EmploymentTribunalsProcess {
    
    protected id = "EmploymentTribunalsSearch";           
    protected name: "Employment Tribunals Search";
    protected pattern: RegExp = ANY;

    public table = {

        columns: [
            { title: "Title", key: "title", type: "Text" },
            { title: "Link", key: "link", type: "Text" },
            { title: "Date", key: "date", type: "Text" }
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
            await this.driver.get(`https://www.gov.uk/employment-tribunal-decisions?keywords=${searchTerm}`);

            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err);
        }
    }

    // Function to scrape company
    public async scrapeTribunals(tribunals): Promise<SearchioResponse> {
        
        const t = this;

        try {
            
            for(let tribunal of tribunals) {

                let title = await tribunal.findElement(t.webdriver.By.xpath('./a')).getText();
                let link = await tribunal.findElement(t.webdriver.By.xpath('./a')).getAttribute('href');
                let date = await tribunal.findElement(t.webdriver.By.xpath('./ul/li/time')).getText();
                
                this.table.rows.push({
                    title: title,
                    link: link,
                    date: date
                });
                
            }
            
            return this.success(`Successfully scraped tribunals`);

        } catch(err) {
            return this.error(`Error scraping tribunals`, err);
        }
    }

    // Function to call flipThrough and scrape results
    public async scrapePages(): Promise<SearchioResponse> {
        try {
            await this.waitForElement('//ul[@class="gem-c-document-list gem-c-document-list--no-underline"]', 15);
            
            await this.flipThrough('//li[@class="gem-c-pagination__item gem-c-pagination__item--next"]', '//ul[@class="gem-c-document-list gem-c-document-list--no-underline"]/li', this.scrapeTribunals.bind(this), 2)

            return this.success(`Successfully performed tribunals scrape`);

        } catch(err) {
            return this.error(`Error scraping tribunals`, err);
        }
    }

    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            await this.loadSearch(searchTerm);
            
            await this.scrapePages();

            await this.pause(15000);

            return this.success(`Successfully performed Employment Tribunals search`, this.table);

        } catch(err) {
            return this.error(`Error searching Employment Tribunals`, err);
        }
    }

}