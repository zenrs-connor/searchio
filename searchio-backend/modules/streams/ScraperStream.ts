//import { Console } from "console";
import { Stream } from "./Stream";


require('chromedriver');


import { WebElement } from 'selenium-webdriver';
import { error, success } from "../ResponseHandler";
import { SearchioResponse } from "../../models/SearchioResponse";

var options = {'args':['--disable-notifications','--no-sandbox']}



export class ScraperStream extends Stream {

    protected webdriver = require('selenium-webdriver');
    protected capabilities = this.webdriver.Capabilities.chrome().set('goog:chromeOptions',options);;
    protected driver = new this.webdriver.Builder().withCapabilities(this.capabilities).build();

    constructor(query: string) {
        super(query);
    }


    // Function to pause/wait for a specified number of milliseconds
    public async pause(ms: number = 0): Promise<SearchioResponse> {
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

            await this.driver.get('https://www.google.com/');
            await this.pause(1000);
            await this.driver.findElement(this.webdriver.By.xpath('//div[@class="J2ipb HOq4He"]/div[3]/button[2]')).click();

            return success(`(ScraperStream) Search engine loaded`); 
            
        } catch (err) {
            return error(`(ScraperStream) Error loading search engine`, err);
        }
    }

    // Function to navigate to a given URL
    public async naviagteTo(url: string): Promise<SearchioResponse> {
        try {
            await this.driver.get(url);
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
                    let prevH =  await this.driver.executeScript('return document.documentElement.scrollTop;');
                    console.log('\n\nCURRENT SCROLL HEIGHT:', prevH);
                    this.driver.executeScript('window.scrollTo(0, document.body.scrollHeight)');
                    iterations +=1; 
                    let newH = await this.driver.executeScript('return document.documentElement.scrollTop;');
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

            let eles = await this.driver.findElements(this.webdriver.By.xpath("//li[@class='first']/a"));
            console.log(`\nPAGE ${pages}`);
            console.log(`Got ${eles.length} elements`);

            await process(eles);

            if (pages >= pageLimit){
                console.log("\nSet page limit reached");
                return;
            }

            pages++;

            let button = await this.driver.findElements(this.webdriver.By.xpath(nextXPath));
    
            if(button.length > 0) {
                await this.driver.findElement(this.webdriver.By.xpath(nextXPath)).click();
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

                let title = await div.findElement(this.webdriver.By.className("title may-blank ")).getText();
                console.log(`Title: ${titleNo} - ${title}`);
                titleNo += 1;

            }
            return success(`(ScraperStream) Successfully stripped titles`);
            
        } catch (err) {
            return error(`(ScraperStream) Could not strip titles`, err);
        }
    }

    // Function that takes in links and opens them in a new tab iteratively to perform a process
    public async openKillTab(links: any[], process: any): Promise<SearchioResponse> {
        let results: any[] = [];
        
        try {
            for(let link of links) {

                // Opening link in new tab
                await link.sendKeys(this.webdriver.Key.CONTROL + this.webdriver.Key.RETURN);
                
                await this.pause(2000);

                // Switching tabs
                let tabs = await this.driver.getAllWindowHandles();
                console.log(`START TABS: ${tabs}`);
                await this.driver.switchTo().window(tabs[tabs.length - 1]);
                
                // Performing process
                let result = await process();
                results.push(result.data);

                
                await this.pause(1500);
                
                // Killing tab
                await this.driver.close();
                await this.pause(2000);
                await this.driver.switchTo().window(tabs[tabs.length - 2]);
                console.log(`END TABS: ${tabs}`);
                

            }
            return success(`(ScraperStream) Successfully iterated links and opened/killed tabs`,results);
        } catch(err) {
            console.log(err);
            return error(`(ScraperStream) Could not iterate through links opening/killing tabs`, err);
        }
    }

    // Function to collect links when given XPath
    public async collectLinks(XPath: string): Promise<SearchioResponse> {
        try {

            let links = await this.driver.findElements(this.webdriver.By.xpath(XPath));
            return success(`(ScraperStream) Successfully collected links`, links);
            
        } catch (err) {
            return error(`(ScraperStream) Could not collect links`, err);
        }
    }

    // Function to wait until an element loads in
    public async waitForElement(xpath: string, seconds: number): Promise<SearchioResponse> {
        try{

            return new Promise(resolve => {

                let iterations = 0
                const interval = setInterval( async () => {

                    iterations++;

                    let element = await this.driver.findElements(this.webdriver.By.xpath(xpath));

                    if (element.length > 0) {
                        clearInterval(interval);
                        resolve(undefined);
                        return success(`(ScraperStream) Successfully waited and found element`);
                    }

                    if(iterations >= seconds) {
                        clearInterval(interval);
                        resolve(undefined);
                        return error(`(ScraperStream) Error waiting for and findings element`);
                    }
                }, 1000);
            });

        } catch {
            return error(`(ScraperStream) Error waiting for and findings element`);
        }
    }

    // Function to iterate through tabs and perform a given process when also given the xpath for the tabs
    // public async flipThroughTabs(tabsXPath: string, processes: any, tabLimit: number = 10): Promise<SearchioResponse> {

    //     let tabsNo: number = 1;

    //     try {
    //         let tabs = await this.driver.findElements(this.webdriver.By.xpath(tabsXPath));

    //         console.log(`\nTAB ${tabsNo}`);
    //         console.log(`Got ${tabs.length} elements`);

    //         for(let tab of tabs) {
                
    //             let text = await tab.getText();
    //             text = text.split(/\r?\n/)[0];

    //             console.log(`Clicking tab ${tabsNo} (${text})`);
    //             await tab.click();

    //             console.log(`\n\nTAB ${tabsNo} is ${text}`);

    //             // if(processes[text]) {
    //             //     let result = await processes[text]();
    //             // } else {
    //             //     error(`(ScraperStream) No process match current tab`);
    //             // }


    //             if (tabsNo >= tabLimit) {
    //                 console.log("\nSet tab limit reached");
    //                 return;
    //             }

    //             tabsNo++;

    //         }

    //         return success(`(ScraperStream) Successfully flipped through tabs`);

    //     } catch(err) {
    //         console.log(err);
    //         return error(`(ScraperStream) Error flipping through tabs`, err);
    //     }
        

    // }

}
