import { SearchioResponse } from "../../../models/SearchioResponse";
import { SocketService } from "../../SocketService";
import { ANY } from "../../../assets/RegexPatterns";
import { PSNProfilesProcess } from "./PSNProfilesProcess";
import { ResultData } from "../../../models/ResultData";


export class PSNProfilesSearch extends PSNProfilesProcess {
    
    protected id = "PSNProfilesSearch";
    protected name: string = "Profiles Search";
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
        this.initWebdriver();
        let result = await this.search();
        this.destroyWebdriver();
        return result;
    }

    // Load the search
    public async loadSearch(searchTerm: string = this.query): Promise<SearchioResponse> {
        try {
            await this.driver.get(`https://psnprofiles.com/${searchTerm}`);

            return this.success(`Successfully loaded search`);

        } catch(err) {
            return this.error(`Error loading search`, err);
        }
    }



    // Function to look at results
    public async scrapeResult(): Promise<SearchioResponse> {

        try {

            await this.waitForElement('//body[@class="app"]', 10);

            let check = await this.driver.findElements(this.webdriver.By.xpath('//table[@id="gamesTable"]'));
            if(check.length == 0) {
                return this.error(`Invalid PSN ID`, 'Invalid PSN ID');
            } else {

                // Collect some general information
                let psnID = await this.driver.findElement(this.webdriver.By.xpath('//span[@class="username"]')).getText();
                let pictureClass = await this.driver.findElement(this.webdriver.By.xpath('//ul[@class="profile-bar"]/div/div/img')).getAttribute('class');
                let profilePicture = await this.driver.findElement(this.webdriver.By.xpath('//ul[@class="profile-bar"]/div/div/img')).getAttribute('src');
                let totalGamesPlayed = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="stats flex"]/span')).getText();
                totalGamesPlayed = totalGamesPlayed.replace('\nGAMES PLAYED', '');
                
                // Collect all the public games that have been played
                let games = await this.driver.findElements(this.webdriver.By.xpath('//table[@id="gamesTable"]/tbody/tr'));
                let gameList = [];
                
                // Iterate through all the games
                for(let game of games) {
                    let gameTitle = await game.findElement(this.webdriver.By.xpath('.//a[@class="title"]')).getText();
                    let progress = await game.findElement(this.webdriver.By.xpath('.//div[@class="progress-bar"]/span')).getText();

                    let gameFormat: {   
                        gameTitle: string,
                        progress?: string,
        
                    } = {
                        gameTitle: undefined
                    };
        
                    gameFormat.gameTitle = gameTitle;
                    gameFormat.progress = progress;

                    gameList.push(gameFormat);

                }

                let PSNProfile: {   
                    psnID: string,
                    pictureClass?: string,
                    profilePicture?: string,
                    totalGamesPlayed?: string,
                    games?: string[]
    
                } = {
                    psnID: undefined
                };
    
                PSNProfile.psnID = psnID;
                PSNProfile.pictureClass = pictureClass;
                PSNProfile.profilePicture = profilePicture;
                PSNProfile.totalGamesPlayed = totalGamesPlayed;
                PSNProfile.games = gameList;
    
                return this.success(`Successfully scraped PSN profile`, PSNProfile);
            }

        } catch(err) {
            return this.error(`Error attempting to scrape PSN profile`, err);
        }
    }

    // Main function called to perform search
    public async search(searchTerm: string = this.query): Promise<SearchioResponse> {
        try{
            await this.loadSearch(searchTerm);

            let profile = await this.scrapeResult();

            await this.pause(5000);

            let results: ResultData[] = [];

            results.push({ name: "PSN ID", type: "Text", data: profile.data.psnID });
            results.push({ name: "Profile Picture", type: "Image", data: profile.data.profilePicture });
            results.push({ name: "Total Games Played", type: "Text", data: profile.data.totalGamesPlayed });

            let arr = [];
            for(let game of profile.data.games) {
                if(game.gameTitle !== '') arr.push(game.gameTitle);
            }

            results.push({ name: "Games Played", type: "Text", data: arr });


            return this.success(`Successfully preformed search on PSN profile`, results);

        } catch(err) {
            return this.error(`Error preforming search on PSN profile`, err);
        }
    }

}