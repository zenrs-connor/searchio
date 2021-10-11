import { SearchioResponse } from "../../../models/SearchioResponse";
import { error, success } from "../../ResponseHandler";
import { ScraperStream } from "../ScraperStream";

export class RapidCarCheckStream extends ScraperStream {
    constructor(query: string) {
        super(query);
        this.tags.push("rapid-car-check");
        console.log(this.tags);
    }

    public async loadVehicleDetails(reg: string): Promise<SearchioResponse> {
        try{
            reg = reg.replace(/\s+/g, '+');
            await this.driver.get(`https://www.rapidcarcheck.co.uk/results?RegPlate=${reg}`);

            // Check daily lookup limit has not been met
            //await this.waitForElement('//h1[@class="eltdf-title-text entry-title"]', 5);
            let elements = await this.driver.findElements(this.webdriver.By.xpath('//h1[@class="eltdf-title-text entry-title"]'));
            for(let element of elements){
                let text = await element.getText();
                if(text == "Daily Lookup Limit"){
                    console.log(`(RapidCarCheckStream) Error daily lookup limit has been met`);
                    return error(`(RapidCarCheckStream) Error daily lookup limit has been met`);
                }
            }

            return success(`(RapidCarCheckStream) Successfully loaded vehicle details`);
        } catch(err) {
            console.log(err);
            return error(`(RapidCarCheckStream) Error loading vehicle details`, err);
        }
    }

    public async scrapeVehicleInformation(reg: string): Promise<SearchioResponse> {
        try{
            let carFormat: {   
                registrationPlate: string, 
                vehicleMake?: string,
                vehicleModel?: string,
                vehicleColour?: string,
                vehicleType?: string,
                bodyStyle?: string,
                fuelType?: string,
                cylinderCapacity?: string,
                vehicleBHP?: string,
                topSpeed?: string,
                zeroToSixty?: string,
                averageYearlyMileage?: number,
                insuranceGroup?: string,
                lastV5C?: Date,
                vehicleAge?: string,
                yearofManufacture?: Date,

                mileageIssues?: string,
                salvageHistory?: string,
                exportMarker?: string,

                motStatus?: string,
                motDue?: Date,
                motRecordCount?: number,
                motLast?: string,

                taxStatus?: string, 
                taxDue?: Date,
                co2Emissions?: string,
                yearlyTaxCost?: string

            } = {
                registrationPlate: undefined
            };

            carFormat.registrationPlate = reg;

            await this.waitForElement('//div[@class="eltdf-full-width-inner"]', 20);

            // These elements are not able to have an exact xpath
            let container = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="eltdf-full-width-inner"]/div[2]/div/div[2]'));
            let elements = await container.findElements(this.webdriver.By.xpath('.//div[@class="wpb_text_column wpb_content_element "]/div/p'));

            for(let element of elements) {
                let text = await element.getText();
                text = text.split(':');
                
                if(text[0] == 'Model') {
                    carFormat.vehicleModel = text[1];
                } else if(text[0] == 'Vehicle Type') {
                    carFormat.vehicleType = text[1];
                } else if (text[0] == 'Fuel Type') {
                    carFormat.fuelType = text[1];
                } else if (text[0] == 'BHP') {
                    carFormat.vehicleBHP = text[1];
                } else if(text[0] == '0-60 MPH') {
                    carFormat.zeroToSixty = text[1]
                } else if(text[0] == 'Insurance Group') {
                    carFormat.insuranceGroup = text[1];
                } else if(text[0] == 'Vehicle Age') {
                    carFormat.vehicleAge = text[1];
                } else if(text[0] == 'Sample Report') {
                    // Do nothing
                } else if(text[0] == 'Mileage') {
                    carFormat.mileageIssues = text[1];
                } else if(text[0] == 'Salvage History') {
                    carFormat.salvageHistory = text[1];
                } else if(text[0] == 'Exported') {
                    carFormat.exportMarker = text[1];
                } else {
                    console.log(`(RapidCarCheckStream) Scraping vehicle information. Could not handle ${text[0]} with value ${text[1]}`);
                }
            }

            // These elements are able to have an exact xpath
            let vehicleMake = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="wpb_text_column wpb_content_element  vc_custom_1549901010336"]/div/p/strong')).getText();
            carFormat.vehicleMake = vehicleMake;

            let vehicleColour = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="wpb_text_column wpb_content_element  vc_custom_1549901033771"]/div/p/strong')).getText();
            carFormat.vehicleColour = vehicleColour;

            let bodyStyle = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="wpb_text_column wpb_content_element  vc_custom_1606469927133"]/div/p/strong')).getText();
            carFormat.bodyStyle = bodyStyle;

            let cylinderCapacity = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="wpb_text_column wpb_content_element  vc_custom_1549901067536"]/div/p/strong')).getText();
            carFormat.cylinderCapacity = cylinderCapacity;


            // These are two elements that have the same xpath
            elements = await this.driver.findElements(this.webdriver.By.xpath('//div[@class="wpb_text_column wpb_content_element  vc_custom_1570540199484"]/div/p'));

            for(let element of elements) {
                let text = await element.getText();
                text = text.split(':');
                
                if(text[0] == 'Top Speed') {
                    carFormat.topSpeed = text[1];
                } else if(text[0] == 'AVG Yearly Mileage') {
                    carFormat.averageYearlyMileage = text[1];
                } else {
                    console.log(`(RapidCarCheckStream) Scraping vehicle information. Could not handle ${text[0]} with value ${text[1]}`);
                }
            }

            let lastV5C = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="wpb_text_column wpb_content_element  vc_custom_1606470542271"]/div/p/strong')).getText();
            carFormat.lastV5C = lastV5C;

            let yearofManufacture = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="wpb_text_column wpb_content_element  vc_custom_1609182735332"]/div/p/strong')).getText();
            carFormat.yearofManufacture = yearofManufacture;


            // These elements are regarding the tax and mot information
            container = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="eltdf-full-width-inner"]/div[2]/div/div[3]'));
            elements = await container.findElements(this.webdriver.By.xpath('.//div[@class="wpb_text_column wpb_content_element "]/div/p'));

            for(let element of elements) {
                let text = await element.getText();
                text = text.split(':');
                
                if(text[0] == 'Model') {
                    carFormat.vehicleModel = text[1];
                } else if(text[0] == 'MOT Due Date') {
                    carFormat.motDue = text[1];
                } else if (text[0] == 'Previous MOT Records') {
                    carFormat.motRecordCount = text[1];
                } else if (text[0] == 'TAX Due Date') {
                    carFormat.taxDue = text[1];
                } else {
                    console.log(`(RapidCarCheckStream) Scraping vehicle information. Could not handle ${text[0]} with value ${text[1]}`);
                }
            }

            let motLast = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="wpb_text_column wpb_content_element  vc_custom_1609840794837"]/div/p/strong')).getText();
            carFormat.motLast = motLast;

            let motContainer = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="eltdf-full-width-inner"]/div[2]/div/div[3]/div/div/div[3]/div/h3'));
            let motInvalid = await motContainer.findElements(this.webdriver.By.xpath('.//i[@class="eltdf-icon-font-awesome fa fa-exclamation-triangle eltdf-icon-element"]'));
            let motValid = await motContainer.findElements(this.webdriver.By.xpath('.//i[@class="eltdf-icon-font-awesome fa fa-check-circle eltdf-icon-element"]'));
            
            if(motInvalid.length > 0 && motValid.length > 0) {
                carFormat.motStatus = "Unknown";
            } else if (motInvalid.length == 0 && motValid.length == 0) {
                carFormat.motStatus = "Unknown";
            } else if (motValid.length >= 1) {
                carFormat.motStatus = "Valid";
            } else if (motInvalid.length >= 1){
                carFormat.motStatus = "Invalid";
            } else {
                carFormat.motStatus = "Unknown";
            }

            let taxContainer = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="eltdf-full-width-inner"]/div[2]/div/div[3]/div/div/div[10]/div/h3'));
            let taxInvalid = await taxContainer.findElements(this.webdriver.By.xpath('.//i[@class="eltdf-icon-font-awesome fa fa-exclamation-triangle eltdf-icon-element"]'));
            let taxValid = await taxContainer.findElements(this.webdriver.By.xpath('.//i[@class="eltdf-icon-font-awesome fa fa-check-circle eltdf-icon-element"]'));

            if(taxInvalid.length > 0 && taxValid.length > 0) {
                carFormat.taxStatus = "Unknown";
            } else if (taxInvalid.length == 0 && taxValid.length == 0) {
                carFormat.taxStatus = "Unknown";
            } else if (taxValid.length >= 1) {
                carFormat.taxStatus = "Valid";
            } else if (taxInvalid.length >= 1){
                carFormat.taxStatus = "Invalid";
            } else {
                carFormat.taxStatus = "Unknown";
            }

            console.log(carFormat);

            return success(`(RapidCarCheckStream) Successfully scraped vehicle information`, carFormat);
        } catch(err) {
            console.log(err);
            return error(`(RapidCarCheckStream) Error scraping vehicle information`, err);
        }
    }

    public async scrapeMileageInformation(reg: string): Promise<SearchioResponse> {
        try{
            let mileageFormat: {   
                estimatedMileage: string,
                mileageData?: any[]

            } = {
                estimatedMileage: undefined
            };
            
            // Check mileage information is present
            let container = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="eltdf-full-width-inner"]/div[3]'));
            let check = await container.getText();
            
            if(check.length == 0) {
                mileageFormat.estimatedMileage = "Not Available";
                mileageFormat.mileageData = [];
                return success(`(RapidCarCheckStream) No mileage information available`, mileageFormat);
            } else {

                let mileageGraph = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="mileagegraph"]'));
                let mileageDates = await mileageGraph.findElement(this.webdriver.By.xpath('./input[@id="MileageYearList"]')).getAttribute('value');
                mileageDates = mileageDates.split(',');
                let mileageFigures = await mileageGraph.findElement(this.webdriver.By.xpath('./input[@id="MileageFiguresX"]')).getAttribute('value');
                mileageFigures = mileageFigures.split(',');

                let data: any[] = [];
                for(let i = 0; i < mileageDates.length; i++) {
                    let entry : {
                        date: Date,
                        value?: string
                    } = {
                        date: undefined
                    };

                    entry.date = mileageDates[i];
                    entry.value = mileageFigures[i];
                    console.log(entry);
                    data.push(entry);
                }

                mileageFormat.mileageData = data;

                let estimatedMileage = await this.driver.findElement(this.webdriver.By.xpath('//div[@class="wpb_text_column wpb_content_element  vc_custom_1559137789162"]/div/p/strong')).getText();
                mileageFormat.estimatedMileage = estimatedMileage;
                
                return success(`(RapidCarCheckStream) Successfully scraped vehicle mileage information`);
            }
        } catch(err) {
            console.log(err);
            return error(`(RapidCarCheckStream) Error scraping vehicle mileage information`, err);
        }
    }

    public async scrapeMOTHistory(reg: string): Promise<SearchioResponse> {
        try{
            let motFormat: {
                motData?: any[],
                firstMOTDue?: Date

            } = {
                motData: undefined
            };

            let motCheck: {
                date: Date,
                passFail?: string,
                mileage?: string,
                expiryDate?: Date,

            } = {
                date: undefined
            };

            return success(`(RapidCarCheckStream) Successfully scraped vehicle MOT history`);
        } catch(err) {
            console.log(err);
            return error(`(RapidCarCheckStream) Error scraping vehicle MOT history`, err);
        }
    }

    public async scrapeVehicleDetails(reg: string): Promise<SearchioResponse> {
        try{
            await this.loadVehicleDetails(reg);
            // let vehicleInformation = await this.scrapeVehicleInformation(reg);
            // let vehicleDetails = vehicleInformation.data;

            // let mileageInformation = await this.scrapeMileageInformation(reg);
            // vehicleDetails.estimatedMileage = mileageInformation.data.estimatedMileage;
            // vehicleDetails.mileageData = mileageInformation.data.mileageData;


            // let motHistoryInformation = await this.scrapeMOTHistory(reg);

            return success(`(RapidCarCheckStream) Successfully loaded vehicle details`);
        } catch(err) {
            
            return error(`(RapidCarCheckStream) Error loading vehicle details`, err);
        }
    }
}