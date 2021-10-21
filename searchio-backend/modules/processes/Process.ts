import { ProcessData } from "../../models/ProcessData";
import { SearchioResponse } from "../../models/SearchioResponse";
import { DataSourceName } from "../../types/DataSourceName";
import { ProcessCode, ProcessStatus, ProcessStatusCodeEnum } from "../../types/ProcessStatusCode";
import { ResponseEmitter } from "../ResponseEmitter";
import { SocketService } from "../SocketService";
import * as MD5 from "md5";

//  Class to control each individual process held by a Stream

require('chromedriver');

import { WebElement } from 'selenium-webdriver';
import { ResultData } from "../../models/ResultData";
import { ProcessResult } from "../../models/ProcessResult";
import { NumberFormats } from "../../models/NumberFormats";



export class Process extends ResponseEmitter {

    protected id: string = "Unnamed Process"                    //  ID defined in each child class
    protected query: string = "";                               //  Query that the process is acting upon
    protected source: DataSourceName = "Unknown";        //  Source that this process is called from
    protected name: string = "Unnamed Process"                  //  The name of the process - should be all lowercase with words separated by spaced
    protected status: ProcessStatus = "DORMANT";                //  Status code - for reference check the StreamStatusCode.ts type
    protected code: ProcessCode = 1;                            //  Status code - for reference check the StreamStatusCode.ts type
    protected message: string = "Awaiting instruction...";      //  A message to describe the current status of this process
    protected pattern: RegExp = /^$/;

    //  Webdriver Variables
    protected webdriver: any;
    protected capabilities: any;
    protected driver: any;
    


    constructor(socket: SocketService, query: string = "") {
        super(socket);
        this.query = query;
    }

    //  Function to build a webdriver to use for scraping
    //  Defaults to headless, so make to to assign headless = false when testing
    public initWebdriver(headless: boolean = true) {

        var options = { args:['--disable-notifications','--no-sandbox']}
        if(headless) options.args.push('--headless');
        this.webdriver = require('selenium-webdriver');
        this.capabilities = this.webdriver.Capabilities.chrome().set('goog:chromeOptions' ,options);
        this.driver = new this.webdriver.Builder().withCapabilities(this.capabilities).build();

    }

    //  Function to destroy the webdriver after a process has completed
    //  Make sure to call this at the end of each scraping process to prevent memory leaks into unused browser windows. 
    public destroyWebdriver() {
        this.driver.close();
        delete this.webdriver;
        delete this.capabilities;
        delete this.driver;
    }

    public getPattern(): RegExp { return this.pattern; }

    //  Sets the status of this process and emits its new Status
    public setStatus(code: ProcessCode | ProcessStatus, message: string = "") {

        //  Predending on the type of code provided
        if(typeof code === "number") {
            //  Update the code values
            this.code = code;
            this.status = ProcessStatusCodeEnum[code] as ProcessStatus;
        } else {
            //  Update the code values
            this.status = code;
            this.code = ProcessStatusCodeEnum[code] as ProcessCode;
        }

        //  If no message has been provided
        if(message === "") {

            //  Update message to a default value
            switch(this.status) {
                case "DORMANT":
                    this.message = "Awaiting command..."
                    break;
                case "ACTIVE":
                    this.message = "Executing process..."
                    break;
                case "COMPLETED":
                    this.message = "Process complete!"
                    break;
                case "ERROR":
                    this.message = "Error!"
                    break;
            }

        } else {
            //  Else update the message
            this.message = message;
        }

        //  Emit the updated data to the socket
        this.socket.processUpdate(this.getData());

    }

    //  Returns the current state of the Process
    public getData(): ProcessData {
        return {
            query: this.query,
            source: this.source,
            name: this.name,
            status: this.status,
            code: this.code,
            message: this.message
        }
    }


    //  Start the process
    public async execute() {
        
        this.setStatus("ACTIVE");

        try {

            //  Begin the process function
            const response = await this.process();

            if(response.success) {

                //  Update the status of this process to Completed
                this.setStatus("COMPLETED", response.message);

                //  Build a formatted result to be emitted and cached
                const result = this.buildResult(response.data);

                //  Emit the result of this process
                this.socket.result(result as ProcessResult);

            } else {
                //  If an error has occured as a result of the process, update the status to Error
                this.setStatus("ERROR", response.message);
            }
        } catch(err) {

            //  In the case of an uncaught process error, update the status to Error
            this.setStatus("ERROR", JSON.stringify(err))
        }

    }

    protected buildResult(data: ResultData[]): ProcessResult {

        //  Build the ProcessResult object without 
        const result: any = {
            source: this.source,
            process_id: this.id,
            process: this.name,
            data: data
        }
        
        //  Create a hash of this result data, then 
        result.hash = MD5(result);
        result.query = this.query;

        return result as ProcessResult;

    }

    //  ABSTRACT FUNCTION!
    //  This function is the meat of the whole class
    //  Each child of this class should define its singular functionality functionality
    protected async process(): Promise<SearchioResponse> {
        return this.success("Success!");
    }

    
    /* SCRAPER FUNCTIONALITY */

    // Function to pause/wait for a specified number of milliseconds
    public async pause(ms: number = 0): Promise<SearchioResponse> {
        try {
            return new Promise((resolve) => {
          
                console.log(`Pausing for ${ms} ms`);
                setTimeout(() => {
                    resolve(undefined);
                }, ms)
                return this.success(`Paused for ${ms} milliseconds`); 
            });
        } catch(err) {
            return this.error(`Error pausing`, err)
        }
        
    }

    // Function to load search egnine and accept cookies
    public async loadSearchEngine (): Promise<SearchioResponse> {
        
        try {

            await this.driver.get('https://www.google.com/');
            await this.pause(1000);
            await this.driver.findElement(this.webdriver.By.xpath('//div[@class="J2ipb HOq4He"]/div[3]/button[2]')).click();

            return this.success(`Search engine loaded`); 
            
        } catch (err) {
            return this.error(`Error loading search engine`, err);
        }
    }

    // Function to navigate to a given URL
    public async naviagteTo(url: string): Promise<SearchioResponse> {
        try {
            await this.driver.get(url);
            await this.pause(1500);

            return this.success(`Navigated successfully`); 

        } catch (err) {

            return this.error(`Error navigating to given URL`, err);

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
                        return this.success(`Successfully scrolled to bottom of page`); 
                    }
                }, 5000);
            });

        } catch (err) {

            return this.error(`Error scrolling to bottom of page`, err);

        }
    }


    // Function to iterate through pages, perform a given processon all collected elements when also given the xpath for the next button
    public async flipThrough(nextXPath: string, collectElements: string, process: Function, pageLimit: number = 100): Promise<SearchioResponse> {

        let pages: number = 0;
        let processComplete = false;
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
                await t.driver.findElement(t.webdriver.By.xpath(nextXPath)).click();
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

    // TEST FUNCTION - Function to strip titles on old.reddit
    public async stripTitles(divs: WebElement[]): Promise<SearchioResponse> {
        let titleNo: number = 1;
        
        try {

            for(let div of divs) {

                let title = await div.findElement(this.webdriver.By.className("title may-blank ")).getText();
                titleNo += 1;

            }
            return this.success(`Successfully stripped titles`);
            
        } catch (err) {
            return this.error(`Could not strip titles`, err);
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
                await this.driver.switchTo().window(tabs[tabs.length - 1]);
                
                // Performing process
                let result = await process();
                results.push(result.data);

                
                await this.pause(1500);
                
                // Killing tab
                await this.driver.close();
                await this.pause(2000);
                await this.driver.switchTo().window(tabs[tabs.length - 2]);
                

            }
            return this.success(`Successfully iterated links and opened/killed tabs`,results);
        } catch(err) {
            return this.error(`Could not iterate through links opening/killing tabs`, err);
        }
    }

    // Function to collect links when given XPath
    public async collectLinks(XPath: string): Promise<SearchioResponse> {
        try {

            let links = await this.driver.findElements(this.webdriver.By.xpath(XPath));
            return this.success(`Successfully collected links`, links);
            
        } catch (err) {
            return this.error(`Could not collect links`, err);
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
                        return this.success(`Successfully waited and found element`);
                    }

                    if(iterations >= seconds) {
                        clearInterval(interval);
                        resolve(undefined);
                        return this.error(`Error waiting for and findings element`);
                    }
                }, 1000);
            });

        } catch {
            return this.error(`Error waiting for and findings element`);
        }
    }

    public async reformatNumber(number: string): Promise<SearchioResponse> {
        // CODE TO REFORMAT PHONE NUMBERS INTO POSSIBLE FORMATS (LOCAL AND INTERNATIONAL)
        
        try {

        
            // Mobile Phone Formats
            let mobileLocalPattern: RegExp = /^(07)[0-9]{9,9}$/;
            let mobileInternationalPattern: RegExp = /^(\+447)[0-9]{9,9}$/;

            // Landline Formats
            let landlineLocalPattern: RegExp = /^(0)[0-9]{10,10}$/;
            let landlineInternationalPattern: RegExp = /^(\+44)[0-9]{10,10}$/;

            const formatted: NumberFormats = { local: '', international: '' }

            await new Promise((resolve) => {
                //match regex with test
                if (mobileLocalPattern.test(number) == true) {
                    formatted.local = number;

                    let internationalFormat: string = "+44" + number.slice(1,);
                    formatted.international = internationalFormat;

                    resolve(undefined);

                } else if (mobileInternationalPattern.test(number) == true) {
                    formatted.international = number;

                    let localFormat: string = "0" + number.slice(3,);
                    formatted.local = localFormat;

                    resolve(undefined);

                } else if (landlineLocalPattern.test(number) == true) {
                    formatted.local = number;

                    let internationalFormat: string = "+44" + number.slice(1,);
                    formatted.international = internationalFormat;

                    resolve(undefined);

                } else if (landlineInternationalPattern.test(number) == true) {
                    formatted.international = number;

                    let localFormat: string = "0" + number.slice(3,);
                    formatted.local = localFormat;

                    resolve(undefined);

                } else {
                    formatted.local = number;
                    formatted.international = number;
                    resolve(undefined);
                }
            });
        
            return this.success(`Successfully reformatted number`, formatted);

        } catch(err) {
            return this.error(`Could not reformat number`, err);
        }
    }


} 