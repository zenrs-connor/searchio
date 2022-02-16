import { SearchioResponse } from "../../../models/SearchioResponse";
import { SocketService } from "../../SocketService";
import { ANY } from "../../../assets/RegexPatterns";
import { EpieosSkypeProcess } from "./EpieosSkypeProcess";


export class EpieosSkypeSearch extends EpieosSkypeProcess {
    
    protected id = "EpieosSkypeSearch";
    protected name: "EpieosSkype Search";
    protected pattern: RegExp = ANY;

    public table = {

        columns: [
            { title: "Name", key: "name", type: "Text" },
            { title: "Live ID", key: "liveID", type: "Text" },
            { title: "Image", key: "image", type: "Text" }
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
            await this.driver.get(`https://tools.epieos.com/skype.php`);

            // Wait for element to load
            await this.waitForElement('//div[@class="input-group mb-3"]/input', 15);
            
            // Input the search term
            await this.driver.findElement(this.webdriver.By.xpath('//div[@class="input-group mb-3"]/input')).sendKeys(searchTerm);
            
            // Click search
            await this.driver.findElement(this.webdriver.By.xpath('//div[@class="input-group mb-3"]/div[@class="input-group-append"]/span/button')).click();
            
            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err);
        }
    }

    // Function to look at results
    public async scrapeResults(): Promise<SearchioResponse> {

        try {

            // Wait for result to load in
            await this.waitForElement('//div[@class="col-md-4 offset-md-4 mt-5 pt-3"]', 15)
            
            let results = await this.driver.findElements(this.webdriver.By.xpath('//div[@class="col-md-4 offset-md-4 mt-5 pt-3 border"]'));

            for (let result of results) {
                
                let name = await result.findElement(this.webdriver.By.xpath('./p[2]')).getText();
                let liveID = await result.findElement(this.webdriver.By.xpath('./p[3]')).getText();
                let image = await result.findElement(this.webdriver.By.xpath('./p/img')).getAttribute('src');

                console.log('\n')
                name = name.replace('Name : ', '')
                console.log(name)
                liveID = liveID.replace('Skype Id : ', '')
                console.log(liveID)
                console.log(image)

                this.table.rows.push({
                    name: name,
                    liveID: liveID,
                    image: image
                });

            }
            
            return this.success(`Successfully retrieved accounts matching query`);

        } catch(err) {
            return this.error(`Error scraping accounts matching query`, err);
        }
    }

    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            await this.loadSearch(searchTerm);

            let x = await this.scrapeResults();
            console.log(x)

            await this.pause(5000);

            return this.success(`Successfully performed search on Epieos Skype`, this.table);

        } catch(err) {
            return this.error(`Error searching Epieos Skype`, err);
        }
    }

}