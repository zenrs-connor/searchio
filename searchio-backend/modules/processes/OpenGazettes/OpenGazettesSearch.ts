import { SearchioResponse } from "../../../models/SearchioResponse";
import { WebElement } from "selenium-webdriver";
import { SocketService } from "../../SocketService";
import { OpenGazettesProcess } from "./OpenGazettesProcess";
import { BUSINESS } from "../../../assets/RegexPatterns";


export class OpenGazettesSearch extends OpenGazettesProcess {

    protected id = "OpenGazettesSearch";           
    protected name: "OpenGazettesSearch Check";
    protected pattern: RegExp = BUSINESS;


    //  Process extends the ResponseEmitter class, so be sure to include an argument for the socket
    //  Processes also take a query on creation
    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }


    //  Overwrite of the abstract function held in Process.ts
    //  This function is what is called when the Process executes
    //  It returns a SearchioResponse containing any success or error data
    public async process(): Promise<SearchioResponse> {
        this.initWebdriver();
        let result = await this.search();
        this.destroyWebdriver();
        return result;
    }


    // Function to load search
    public async loadSearch(query: string): Promise<SearchioResponse> {

        try {
            query = query.replace(' ', '+');

            await this.driver.get(`http://opengazettes.com/search?utf8=%E2%9C%93&q=${query}&commit=search`);
            
            
            return this.success(`Successfully loaded search`);
        } catch(err) {
            return this.error(`Error loading search`, err)
        }
    }

    // Function to load search
    public async stripNotices(): Promise<SearchioResponse> {

        try {

            const table = {

                columns: [
                    { title: "Title and Snippet", key: "titleSnippet", type: "Text" },
                    { title: "Link", key: "link", type: "Text" }
                ],
                rows: []
            }

            let rows = await this.driver.findElements(this.webdriver.By.xpath('//div[@class="results-list js-results-list"]/div'));
            for(let row of rows) {
                let notices = await row.findElements(this.webdriver.By.xpath('.//div[@class="medium-6 column"]'));
                for(let notice of notices) {
                    let noticeTitle: string;
                    let noticeSnippet: string;
                    let noticeLink: string;

                    let title = await notice.findElements(this.webdriver.By.xpath('.//h2'));
                    if(title.length > 0) {
                        noticeTitle = await notice.findElement(this.webdriver.By.xpath('.//h2')).getText();
                        if(noticeTitle.length < 1) {
                            noticeTitle = "No title";
                        }
                    } else {
                        noticeTitle = 'No title';
                    }

                    let snippet = await notice.findElements(this.webdriver.By.xpath('.//p'));
                    if(snippet.length > 0) {
                        noticeSnippet = await notice.findElement(this.webdriver.By.xpath('.//p')).getText();
                        if(noticeSnippet.length < 1) {
                            noticeSnippet = "No snippet";
                        }
                    } else {
                        noticeTitle = 'No snippet';
                    }

                    let link = await notice.findElements(this.webdriver.By.xpath('.//a[@class="gazette-box"]'));
                    if(link.length > 0) {
                        noticeLink = await notice.findElement(this.webdriver.By.xpath('.//a[@class="gazette-box"]')).getAttribute('href');
                    } else {
                        noticeLink = 'No link';
                    }

                    table.rows.push({
                        titleSnippet: 'Title: ' + noticeTitle + '. Snippet: ' + noticeSnippet,
                        link: noticeLink
                    });

                }
            }
            
            return this.success(`Successfully stripped notices`, table);

        } catch(err) {
            return this.error(`Error stripping notices`, err)
        }
    } 

    // Function to iterate through all company charges and call stripCompanyCharge
    public async search(query: string = this.query): Promise<SearchioResponse> {
        
        try {
            await this.loadSearch(query);

            let notices = await this.stripNotices();

            return this.success(`Successfully completed searched for ${this.query}`, notices.data);

        } catch(err) {
            console.log(err)
            return this.error(`Error completing search for ${this.query}`, err);
        }
    }


}