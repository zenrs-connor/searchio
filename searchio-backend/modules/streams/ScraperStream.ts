import { Console } from "console";
import { Stream } from "./Stream";


require('chromedriver');
var webdriver = require('selenium-webdriver');
import { WebElement } from 'selenium-webdriver';
import { error, success } from "../ResponseHandler";
import { SearchioResponse } from "../../models/SearchioResponse";
let capabilities = webdriver.Capabilities.chrome()
var options = {'args':['--disable-notifications','--no-sandbox']}
capabilities.set('goog:chromeOptions',options)
let driver = new webdriver.Builder().withCapabilities(capabilities).build();



export class ScraperStream extends Stream {

    constructor(query: string) {
        super(query);
    }


    // Function to pause/wait for a specified number of milliseconds
    private async pause(ms: number = 0): Promise<SearchioResponse> {
        try {
            return new Promise((resolve) => {
          
                console.log(`Pausing for ${ms} ms`);
                setTimeout(() => {
                    resolve(undefined);
                }, ms)
                return success(`(ScraperStream) Paused for ${ms} milliseconds`); 
            });
        } catch(err) {
            return error(`(ScraperStream) Error pausing`, err)
        }
        
    }

    // Function to load search egnine and accept cookies
    public async loadSearchEngine (): Promise<SearchioResponse> {
        
        try {

            await driver.get('https://www.google.com/');
            await this.pause(1000);
            await driver.findElement(webdriver.By.xpath('//div[@class="J2ipb HOq4He"]/div[3]/button[2]')).click();

            return success(`(ScraperStream) Search engine loaded`); 
            
        } catch (err) {
            return error(`(ScraperStream) Error loading search engine`, err);
        }
    }

    // Function to navigate to a given URL
    public async naviagteTo(url: string): Promise<SearchioResponse> {
        try {
            await driver.get(url);
            await this.pause(1500);

            return success(`(ScraperStream) Navigated successfully`); 

        } catch (err) {

            return error(`(ScraperStream) Error navigating to given URL`, err);

        }
    }

    // Function to scroll to the bottom of a page or until reaches a given scroll limit
    public async scrollToBottom(scrollLimit: number): Promise<SearchioResponse> {

        let iterations: number = 0;
        let noChange: number = 0;

        try {

            return new Promise(resolve => {
                const interval = setInterval( async () => {
                    let prevH =  await driver.executeScript('return document.documentElement.scrollTop;');
                    console.log('\n\nCURRENT SCROLL HEIGHT:', prevH);
                    driver.executeScript('window.scrollTo(0, document.body.scrollHeight)');
                    iterations +=1; 
                    let newH = await driver.executeScript('return document.documentElement.scrollTop;');
                    console.log('NEW SCROLL HEIGHT:', newH);

                    console.log(`Scroll ${iterations}/${scrollLimit}`);
                    
                    if (prevH == newH) {
                        noChange += 1;
                        console.log(`\nNo change in height: count ${noChange}`);
                    }

                    if(iterations >= scrollLimit || noChange >= 3) {
                        clearInterval(interval);
                        resolve(undefined);
                        return success(`(ScraperStream) Successfully scrolled to bottom of page`); 
                    }
                }, 5000);
            });

        } catch (err) {

            return error(`(ScraperStream) Error scrolling to bottom of page`, err);

        }
    }


    // Function to iterate through pages and perform a given process when also given the xpath for the next button
    public async flipThrough(nextXPath: string, process: Function, pageLimit: number = 100): Promise<SearchioResponse> {

        let pages: number = 1;
        let processComplete = false;

        async function iterate() {

            let eles = await driver.findElements(webdriver.By.xpath("//li[@class='first']/a"));
            console.log(`\nPAGE ${pages}`);
            console.log(`Got ${eles.length} elements`);

            await process(eles);

            if (pages >= pageLimit){
                console.log("\nSet page limit reached");
                return;
            }

            pages++;

            let button = await driver.findElements(webdriver.By.xpath(nextXPath));
    
            if(button.length > 0) {
                await driver.findElement(webdriver.By.xpath(nextXPath)).click();
            } else {
                console.log("\nCannot find next page button");
                return;
            }

            return iterate();
        }


        try {

            let finalResponse = await iterate();

            return success(`(ScraperStream) Flipped though ${pages} pages`);

        } catch(err) {
            return error(`(ScraperStream) Could not flip through pages`, err);
        }
        

    }

    // TEST FUNCTION - Function to strip titles on old.reddit
    public async stripTitles(divs: WebElement[]): Promise<SearchioResponse> {
        let titleNo: number = 1;
        
        try {

            for(let div of divs) {

                let title = await div.findElement(webdriver.By.className("title may-blank ")).getText();
                console.log(`Title: ${titleNo} - ${title}`);
                titleNo += 1;

            }
            return success(`(ScraperStream) Successfully stripped titles`);
            
        } catch (err) {
            return error(`(ScraperStream) Could not strip titles`, err);
        }
    }

    // Function that takes in links and opens them in a new tab iteratively
    public async openKillTab(links: any[]): Promise<SearchioResponse> {
        console.log("Opening links in new tab");
        
        let linkNo: number = 1;
        try {
            for(let link of links) {

                // Opening link in new tab
                await link.sendKeys(webdriver.Key.CONTROL + webdriver.Key.RETURN);
                
                await this.pause(2000);

                // Switching tabs
                let tabs = await driver.getAllWindowHandles();
                console.log(tabs);
                console.log(tabs.length);
                await driver.switchTo().window(tabs[1]);
                let tabTitle = await driver.getTitle();
                console.log(`Tab title: ${tabTitle}`);
                
                await this.pause(1500);
                
                // Killing tab
                console.log(`Killing tab ${linkNo}`);
                await driver.close();
                await this.pause(2000);
                await driver.switchTo().window(tabs[0]);
                
                linkNo += 1;

            }
            return success(`(ScraperStream) Successfully iterated links and opened/killed tabs`);
        } catch(err) {
            return error(`(ScraperStream) Could not iterate through links opening/killing tabs`, err);
        }
    }


    // TEST FUNCTION - Function to test the other functions
    public async main(url: string) {
        await this.loadSearchEngine();
        await this.naviagteTo(url);
        //await this.flipThrough("//span[@class='next-button']/a", this.stripTitles, 2);
        await this.flipThrough("//span[@class='next-button']/a", this.openKillTab.bind(this), 1);
        console.log("\nComplete");
    }

    

}
