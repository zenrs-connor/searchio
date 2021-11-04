import { SearchioResponse } from "../../../models/SearchioResponse";
import { SocketService } from "../../SocketService";
import { ANY } from "../../../assets/RegexPatterns";
import { ICIJProcess } from "./ICIJProcess";
import { ResultData } from "../../../models/ResultData";


export class ICIJSearch extends ICIJProcess {

    protected id = "ICIJSearch";           
    protected name: "ICIJ Check";
    protected pattern: RegExp = ANY;


    //  Process extends the ResponseEmitter class, so be sure to include an argument for the socket
    //  Processes also take a query on creation
    constructor(socket: SocketService, query: string) {
        super(socket, query);
    }


    //  Overwrite of the abstract function held in Process.ts
    //  This function is what is called when the Process executes
    //  It returns a SearchioResponse containing any success or error data
    public async process(): Promise<SearchioResponse> {
        
        await this.initWebdriver(false);
        let result = await this.search();
        await this.destroyWebdriver();
        return result;
    }

    // Function to load search
    public async loadSearch(query: string = this.query): Promise<SearchioResponse> {

        try {
            query = query.replace(' ', '+');

            await this.driver.get(`https://www.icij.org/?s=${query}`);
            

            return this.success(`Successfully loaded search`);
        
        } catch(err) {
            return this.error(`Error loading search`, err)
        }
    }

    // Function to load search
    public async stripArticles(): Promise<SearchioResponse> {

        try {
            let articles = await this.driver.findElements(this.webdriver.By.xpath('//article[@class="row search-item border-bottom mb-3 mt-3 pb-3"]'));
            console.log(`WE HAVE ${articles.length} ARTICLES`);

            for(let article of articles) {
                console.log('\n');
                let title = await article.findElement(this.webdriver.By.xpath('.//h2[@class="article-title__title"]/a')).getText();
                let link = await article.findElement(this.webdriver.By.xpath('.//h2[@class="article-title__title"]/a')).getAttribute('href');

                let image = await article.findElements(this.webdriver.By.xpath('.//div[@class="col-12 col-md-5"]/a/figure/img'));
                if(image.length > 0) {
                    image = await article.findElement(this.webdriver.By.xpath('.//div[@class="col-12 col-md-5"]/a/figure/img')).getAttribute('src');
                    console.log(image);
                }
                console.log(title);
                console.log(link);
            }
            

            return this.success(`Successfully loaded search`);
        
        } catch(err) {
            return this.error(`Error loading search`, err)
        }
    }


    // Main function to call (calls all others)
    public async search(query: string = this.query): Promise<SearchioResponse> {

        try {
            // Load the search
            await this.loadSearch(query);

            await this.stripArticles();
         
            return this.success(`Successfully completed search for ${this.query}`);
        
        } catch(err) {
            return this.error(`Error completing search`, err)
        }
    }

}