import { SearchioResponse } from "../../../models/SearchioResponse";
import { SocketService } from "../../SocketService";
import { ANY } from "../../../assets/RegexPatterns";
import { XboxGamertagProcess } from "./XboxGamertagProcess";


export class XboxGamertagSearch extends XboxGamertagProcess {
    
    protected id = "XboxGamertagSearch";
    protected name: "Xbox Gamertag Search";
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
        this.initWebdriver(false);
        let result = await this.search();
        this.destroyWebdriver();
        return result;
    }

    // Load the search
    public async loadSearch(searchTerm: string = this.query): Promise<SearchioResponse> {
        try {
            await this.driver.get(`https://xboxgamertag.com/search/${searchTerm}`);
            
            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err);
        }
    }


    // Re-define function to iterate through pages, collect elements when also given the xpath for the next button
    public async flipThrough(nextXPath: string, collectElements: string, process: Function, pageLimit: number = 100): Promise<SearchioResponse> {

        let pages: number = 0;
        let results: any[] = [];

        const t = this;

        async function iterate() {
            pages++;

            await t.scrollToBottom(2);

            let eles = await t.driver.findElements(t.webdriver.By.xpath(collectElements));

            for(let el of eles) {
                let link = await el.getAttribute('href');
                results.push(link);
            }

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


    // Function to look at results
    public async scrapeResult(): Promise<SearchioResponse> {

        try {

            await this.waitForElement('//nav[@class="navbar navbar-expand-lg navbar-light bg-xgt"]', 10);

            let check = await this.driver.findElements(this.webdriver.By.xpath('//h1[contains(text(), "exist")]'));
            if(check.length > 0) {
                return this.error(`Invalid Xbox gamertag`, 'Invalid Xbox gamertag');
            } else {

                // Collect some general information
                let gamertag = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="col-12"]')).getText();
                let profilePicture = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="col-auto avatar"]/a/img')).getAttribute('src')
                let gamerScore = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="col-sm-12"]/div/div')).getText();
                let totalGamesPlayed = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="col-sm-12"]/div/div[2]')).getText();

                // Do some formatting and replace text
                gamerScore = gamerScore.replace('Gamerscore\n', '');
                totalGamesPlayed = totalGamesPlayed.replace('Games Played\n', '');
                
                // Collect all the public games that have been played
                let games = await this.driver.findElements(this.webdriver.By.xpath('//div[@class="recent-games"]/div/div[@class="col-lg-4 col-sm-6 col-12"]'));
                let gameList = [];
                
                // Iterate through all the games
                for(let game of games) {
                    let gameTitle = await game.findElement(this.webdriver.By.xpath('.//div[@class="game-card-container"]/div/h3')).getText();
                    let lastPlayed = await game.findElement(this.webdriver.By.xpath('.//div[@class="game-card-container"]/div/p')).getText();

                    let gameFormat: {   
                        gameTitle: string,
                        lastPlayed?: string,
        
                    } = {
                        gameTitle: undefined
                    };
        
                    gameFormat.gameTitle = gameTitle;
                    gameFormat.lastPlayed = lastPlayed;

                    gameList.push(gameFormat);

                }

                // Move to clips
                let currentURL = await this.driver.getCurrentUrl();
                let newURL = currentURL + '/clips/';
                await this.driver.get(newURL);

                // Flip through the pages of clips collecting the links
                let clips = await this.flipThrough('//a[@aria-label="Next"]', '//a[@class="btn-success"]', (null), 10);
                await this.pause(5000);

                let XboxProfile: {   
                    gamertag: string,
                    profilePicture?: string,
                    gamerScore?: string,
                    totalGamesPlayed?: string,
                    games?: string[],
                    clips?: string[]
    
                } = {
                    gamertag: undefined
                };
    
                XboxProfile.gamertag = gamertag;
                XboxProfile.profilePicture = profilePicture;
                XboxProfile.gamerScore = gamerScore;
                XboxProfile.totalGamesPlayed = totalGamesPlayed;
                XboxProfile.games = gameList;
                XboxProfile.clips = clips.data;
    
                return this.success(`Successfully scraped Xbox profile`, XboxProfile);
            }

        } catch(err) {
            return this.error(`Error attempting to scrape Xbox profile`, err);
        }
    }

    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            await this.loadSearch(searchTerm);

            let profile = await this.scrapeResult();

            await this.pause(5000);

            return this.success(`Successfully preformed search on Xbox profile`, profile.data);

        } catch(err) {
            return this.error(`Error preforming search on Xbox profile`, err);
        }
    }

}