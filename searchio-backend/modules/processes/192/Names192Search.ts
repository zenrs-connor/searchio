import { SearchioResponse } from "../../../models/SearchioResponse";
import { SocketService } from "../../SocketService";
import { Names192Process } from "./Names192Process";
import { NAMES } from "../../../assets/RegexPatterns";
import { ResultData } from "../../../models/ResultData";


export class Names192Search extends Names192Process {

    protected id = "Names192Search";           
    protected name: string = "Name Search";
    protected pattern: RegExp = NAMES;

    //  Process extends the ResponseEmitter class, so be sure to include an argument for the socket
    //  Processes also take a query on creation
    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }


    //  Overwrite of the abstract function held in Process.ts
    //  This function is what is called when the Process executes
    //  It returns a SearchioResponse containing any success or error data
    protected async process(): Promise<SearchioResponse> {
        this.initWebdriver(false);
        this.setStatus("ACTIVE", `Searching 192 for records with name: ${this.query}...`);
        let result = await this.nameSearch();
        this.setStatus("COMPLETED", `Successfully retrieved records with name: ${this.query}...`);
        this.destroyWebdriver();
        return result;
    }


    // Function to load 192 and enter in search term
    public async loadSearch(name: string): Promise<SearchioResponse> {
        try {

            await this.driver.get('https://www.192.com/');
            // Accept cookies
            await this.driver.findElement(this.webdriver.By.xpath('//a[@class="js-ont-btn-ok2"]')).click();
            
            await this.pause(3000);

            // Input name and click search button
            await this.driver.findElement(this.webdriver.By.xpath('//input[@id="peopleBusinesses_name"]')).sendKeys(name);
            await this.driver.findElement(this.webdriver.By.xpath('//input[@id="searchBtn"]')).click();

            return this.success(`(Names192Search) Successfully loaded search`);

        } catch(err) {
            this.setStatus("ERROR", `Error loading records with name: ${this.query}...${err}`);
            return this.error(`(Names192Search) Error loading search`, err);
        }
    }
    

    // Function to strip people records
    public async nameSearch(name: string = this.query): Promise<SearchioResponse> {
        
        try {
            
            await this.loadSearch(name);

            const table = {

                columns: [
                    { title: "Name", key: "name", type: "Text" },
                    { title: "Age Guide", key: "ageGuide", type: "Text" },
                    { title: "Sources", key: "sources", type: "Text" },
                    { title: "Director", key: "director", type: "Text" },
                    { title: "Partial Address", key: "partialAddress", type: "Text" },
                    { title: "Other Occupants", key: "otherOccupants", type: "Text" }
                ],
                rows: []
            }

            // Collect all records
            let results = await this.driver.findElements(this.webdriver.By.xpath('//ul[@class="js-ont-gmap-recordset ont-ul-results-list"]/li'));
            
            // Iterate through records and strip info
            for(let result of results){
                
                let rowName;
                let rowAge;
                let rowSources;
                let rowDirector;
                let rowPartialAddress;
                let rowOtherOccupants;
                
                
                let name = await result.findElement(this.webdriver.By.xpath('.//div[@class="test-name"]/a')).getText();
                rowName = name;

                let ageGuide = await result.findElements(this.webdriver.By.xpath('.//div[@class="age-guide"]'));
                if (ageGuide.length == 1) {
                    ageGuide = await result.findElement(this.webdriver.By.xpath('.//div[@class="age-guide"]/span[2]')).getText();
                    rowAge = ageGuide;
                } else {
                    rowAge = 'Unknown';
                }

                let source = await result.findElement(this.webdriver.By.xpath('.//div[@class="test-er-years er-years"]')).getText();
                if (source.length > 0) {
                    //source = source.replace(/\s/g,'');
                    //source = source.slice(2,);
                    //source = source.split(',');
                    source = source.replace(/ER/g,'Electoral Register Years:');
                    rowSources = source;
                } else {
                    rowSources = 'No sources';
                }

                let director = await result.findElements(this.webdriver.By.xpath('.//div[@class="test-director director tick"]'));
                if (director.length == 1) {
                    director = await result.findElement(this.webdriver.By.xpath('.//div[@class="test-director director tick"]')).getText();
                    rowDirector = director;
                } else {
                    rowDirector = 'Unknown';
                }

                let partialAddress = await result.findElement(this.webdriver.By.xpath('.//div[@class="results-address"]/div/span[2]')).getText();
                rowPartialAddress = partialAddress;


                let otherOccupants = await result.findElements(this.webdriver.By.xpath('.//p[@class="test-occupants"]'));
                if (otherOccupants.length > 0) {
                    
                    let element = await result.findElement(this.webdriver.By.xpath('.//div[@class="occupants-full"]'));
                    await this.driver.executeScript('arguments[0].scrollIntoView(true);', element);
                    await this.driver.executeScript("arguments[0].style.visibility='visible';", element);
                    
                    otherOccupants = await result.findElement(this.webdriver.By.xpath('.//p[@class="test-occupants"]')).getText();
                    
                    //otherOccupants = otherOccupants.split(', ');
                    rowOtherOccupants = otherOccupants

                } else {
                    rowOtherOccupants = 'No others listed';
                }

                table.rows.push({
                    name: rowName,
                    ageGuide: rowAge,
                    sources: rowSources,
                    director: rowDirector,
                    partialAddress: rowPartialAddress,
                    otherOccupants: rowOtherOccupants
                });

                
            }
            
            let res: ResultData = {
                name: `Records`,
                type: "Table",
                data: table
            }

            return this.success(`(Names192Search) Successfully collected people records`, [res]);

        } catch(err) {
            this.setStatus("ERROR", `Error retrieving records with name: ${this.query}...${err}`);
            return this.error(`(Names192Search) Error collecting people records`, err)
        }
    }

}
