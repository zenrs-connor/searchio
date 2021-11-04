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

    // Function to strip articles from result page
    public async stripArticles(): Promise<SearchioResponse> {

        try {

            let table = {

                columns: [
                    { title: "Title and Snippet", key: "titleSnippet", type: "Text" },
                    { title: "Link", key: "link", type: "Text" }
                ],
                rows: []
            }


            let articles = await this.driver.findElements(this.webdriver.By.xpath('//article[@class="row search-item border-bottom mb-3 mt-3 pb-3"]'));

            for(let article of articles) {
                
                let articleTitle: string = '';
                let articleLink: string = '';
                let articleImage: string = '';
                let articleSnippet: string = '';
                
                articleTitle = await article.findElement(this.webdriver.By.xpath('.//h2[@class="article-title__title"]/a')).getText();
                articleLink = await article.findElement(this.webdriver.By.xpath('.//h2[@class="article-title__title"]/a')).getAttribute('href');

                let image = await article.findElements(this.webdriver.By.xpath('.//div[@class="col-12 col-md-5"]/a/figure/img'));
                if(image.length > 0) {
                    articleImage = await article.findElement(this.webdriver.By.xpath('.//div[@class="col-12 col-md-5"]/a/figure/img')).getAttribute('src');
                } else {
                    articleImage = 'Image not available';
                }

                let snippet = await article.findElements(this.webdriver.By.xpath('.//p[@class="article-title__excerpt"]'));
                if(snippet.length > 0) {
                    articleSnippet = await article.findElement(this.webdriver.By.xpath('.//p[@class="article-title__excerpt"]')).getText();
                } else {
                    articleSnippet = 'Snippet is not available';
                }

                table.rows.push({
                    titleSnippet: 'Title: ' + articleTitle + '. Snippet: ' + articleSnippet,
                    link: articleLink
                });
                
            }
            
            return this.success(`Successfully stripped articles`, table);
        
        } catch(err) {
            return this.error(`Error stripping articles`, err)
        }
    }


    // Main function to call (calls all others)
    public async search(query: string = this.query): Promise<SearchioResponse> {

        try {
            // Load the search
            await this.loadSearch(query);

            // Strip the articles and returns a table
            let articles = await this.stripArticles();
         
            return this.success(`Successfully completed search for ${this.query}`, articles.data);
        
        } catch(err) {
            return this.error(`Error completing search`, err)
        }
    }

}