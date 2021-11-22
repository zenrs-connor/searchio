import { SearchioResponse } from "../../../models/SearchioResponse";
import { ForeverMissedProcess } from "./ForeverMissedProcess";
import { SocketService } from "../../SocketService";
import { NAMES } from "../../../assets/RegexPatterns";


export class ForeverMissedSearch extends ForeverMissedProcess {
    
    protected id = "ForeverMissed";           
    protected name: "ForeverMissed Search";
    protected pattern: RegExp = NAMES;

    public table = {

        columns: [
            { title: "Title", key: "title", type: "Text" },
            { title: "Created", key: "created", type: "Text" },
            { title: "Description Snippet", key: "description", type: "Text" }
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

    // Function to load search
    public async loadSearch(query: string): Promise<SearchioResponse> {

        try {
            query = query.replace(' ', '+');

            await this.driver.get(`https://www.forevermissed.com/findmemorial/?q=${query}`);
            
            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err)
        }
    }

    // Function to open all the 'see more' links
    public async openAll(pageLimit: number = 3): Promise<SearchioResponse> {

        try {

            return new Promise(resolve => {
                const interval = setInterval( async () => {
                    let showMore =  await this.driver.findElements(this.webdriver.By.xpath('//div[@id="load-more-content"]/a'));
                    if(showMore.length == 1) {
                        await this.driver.findElement(this.webdriver.By.xpath('//div[@id="load-more-content"]/a')).click();
                    } else {
                        clearInterval(interval);
                        resolve(undefined);
                        return this.success(`Successfully opened all see more links`);
                    }
                }, 5000);
            });

        } catch(err) {

            return this.error(`Error opening all see more links`, err);

        }
    }

    // Function to strip all the notices
    public async strip(pageLimit: number = 3): Promise<SearchioResponse> {

        try {
            let notices = await this.driver.findElements(this.webdriver.By.xpath('//ul[@class="memorials-list"]/li'));
            console.log(`We have a total of ${notices.length} notices!`);
            for(let notice of notices) {

                await this.driver.executeScript("arguments[0].scrollIntoView(true);", notice);

                let title: string = '';
                let created: string = '';
                let description: string = '';

                title = await notice.findElement(this.webdriver.By.xpath('.//div[@class="memorial-title"]/a')).getAttribute('title');
                created = await notice.findElement(this.webdriver.By.xpath('.//p[@class="memorial-note"]')).getText();
                description = await notice.findElement(this.webdriver.By.xpath('.//div[@class="memorial-description"]')).getText();

                this.table.rows.push({
                    title: title,
                    created: created,
                    description: description
                });
            }

            return this.success(`Successfully stripped all notices`);

        } catch(err) {
            return this.error(`Error stripping all notices`, err);
        }
    }


    // Main function to call (calls all others)
    public async search(query: string = this.query): Promise<SearchioResponse> {
        
        try {
            await this.loadSearch(query);

            await this.openAll();

            await this.strip();

            return this.success(`Successfully completed searched for ${this.query}`, this.table);

        } catch(err) {
            console.log(err)
            return this.error(`Error completing search for ${this.query}`, err);
        }
    }

}