import { SearchioResponse } from "../../../models/SearchioResponse";
import { error, success } from "../../ResponseHandler";
import { ScraperStream } from "../ScraperStream";
import { WebElement } from "selenium-webdriver";


export class Names192Stream extends ScraperStream {

    constructor(query: string) {
        super(query);
        this.tags.push("192");
        console.log(this.tags);
    }

    // Function to load 192 and enter in search term
    public async loadSearch(name: string): Promise<SearchioResponse> {
        try {
            await this.driver.get('https://www.192.com/');
            await this.driver.findElement(this.webdriver.By.xpath('//a[@class="js-ont-btn-ok2"]')).click();
            
            await this.pause(3000);

            await this.driver.findElement(this.webdriver.By.xpath('//input[@id="peopleBusinesses_name"]')).sendKeys(name);
            await this.driver.findElement(this.webdriver.By.xpath('//input[@id="searchBtn"]')).click();

            return success(`(Names192Stream) Successfully loaded search`);

        } catch(err) {
            console.log(err);
            return error(`(Names192Stream) Error loading search`, err);
        }
    }
    

    // Function to strip a single companies overview 
    public async nameSearch(name: string): Promise<SearchioResponse> {
        
        try {
            
            await this.loadSearch(name);

            let records: any[] = [];

            let results = await this.driver.findElements(this.webdriver.By.xpath('//ul[@class="js-ont-gmap-recordset ont-ul-results-list"]/li'));
            for(let result of results){
                
                let recordFormat: {
                    name: string,
                    ageGuide?: string,
                    source?: any[],
                    director?: string,
                    partialAddress?: string,
                    otherOccupants?: any[]
                } = {
                    name: undefined
                }

                let name = await result.findElement(this.webdriver.By.xpath('.//div[@class="test-name"]/a')).getText();
                recordFormat.name = name;

                let ageGuide = await result.findElements(this.webdriver.By.xpath('.//div[@class="age-guide"]'));
                if (ageGuide.length == 1) {
                    ageGuide = await result.findElement(this.webdriver.By.xpath('.//div[@class="age-guide"]/span[2]')).getText();
                    recordFormat.ageGuide = ageGuide;
                }

                let source = await result.findElement(this.webdriver.By.xpath('.//div[@class="test-er-years er-years"]')).getText();
                if (source.length > 0) {
                    source = source.replace(/\s/g,'');
                    source = source.slice(2,);
                    source = source.split(',');
                    recordFormat.source = source;
                } else {
                    let sourceArray = []
                    recordFormat.source = sourceArray;
                }

                let director = await result.findElements(this.webdriver.By.xpath('.//div[@class="test-director director tick"]'));
                if (director.length == 1) {
                    director = await result.findElement(this.webdriver.By.xpath('.//div[@class="test-director director tick"]')).getText();
                    recordFormat.director = director;
                }

                let partialAddress = await result.findElement(this.webdriver.By.xpath('.//div[@class="results-address"]/div/span[2]')).getText();
                recordFormat.partialAddress = partialAddress;


                let otherOccupants = await result.findElements(this.webdriver.By.xpath('.//p[@class="test-occupants"]'));
                if (otherOccupants.length > 0) {
                    
                    let element = await result.findElement(this.webdriver.By.xpath('.//div[@class="occupants-full"]'));
                    await this.driver.executeScript('arguments[0].scrollIntoView(true);', element);
                    await this.driver.executeScript("arguments[0].style.visibility='visible';", element);
                    
                    otherOccupants = await result.findElement(this.webdriver.By.xpath('.//p[@class="test-occupants"]')).getText();
                    
                    otherOccupants = otherOccupants.split(', ');
                    recordFormat.otherOccupants = otherOccupants

                } else {
                    recordFormat.otherOccupants = [];
                }

                records.push(recordFormat);
            }
            

            return success(`(Names192Stream) Successfully collected company overview`, records);
        } catch(err) {
            console.log(err);
            return error(`(Names192Stream) Error collecting company overview`, err)
        }
    }

}
