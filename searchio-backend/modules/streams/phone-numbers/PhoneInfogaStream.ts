import { NumberFormats } from "../../../models/NumberFormats";
import { Stream } from "../Stream";

export class PhoneInfogaStream extends Stream {
    
    constructor(query: string) { 
        super(query); 
        this.tags.push("google");
        console.log(this.tags);
    }

    protected orIntextOne: string = "%22+OR+intext%3A%22%2B";
    protected orIntextTwo: string = "%22+OR+intext%3A%22";
    protected endQuotation: string = "%22";

    protected socialMediaDorks: string[] = [];
    protected footprintDorks: string[] = [];
    protected temporaryDorks: string[] = [];



    /*public async query(number: string) {
        await new Promise((resolve) => {
            this.reformatNumber(number).then(formattedNumber => {
                console.log(formattedNumber);
                this.generateSocialMediaDorks(formattedNumber).then(() => {
                    this.generateFootprintDorks(formattedNumber).then(() => {
                        this.generateTemporaryDorks(formattedNumber).then(() => {
                            console.log(this.socialMediaDorks);
                            console.log(this.footprintDorks);
                            console.log(this.temporaryDorks);
                            resolve(undefined);
                        });
                    });
                });
            });
        });
    }*/

    public async generateSocialMediaDorks(numbers: NumberFormats) {
        await new Promise((resolve) => {
            let sites: String[] = [
                "https://www.google.com/search?q=site%3Afacebook.com+intext%3A%22",
                "https://www.google.com/search?q=site%3Atwitter.com+intext%3A%22",
                "https://www.google.com/search?q=site%3Alinkedin.com+intext%3A%22",
                "https://www.google.com/search?q=site%3Ainstagram.com+intext%3A%22",
                "https://www.google.com/search?q=site%3Avk.com+intext%3A%22"
            ]
            for(let i = 0; i< sites.length; i++){
                let site = sites[i];
                let link: string = site + numbers.international.slice(1,) + this.orIntextOne + numbers.international.slice(1,) + this.orIntextTwo + numbers.local + this.endQuotation;
                this.socialMediaDorks.push(link);
            }
            resolve(undefined);

        });
        return(undefined);
    }

    public async generateFootprintDorks(numbers: NumberFormats) {
        await new Promise((resolve) => {
            let sites: String[] = [
                "https://www.google.com/search?q=site%3Async.me+intext%3A%22",
                "https://www.google.com/search?q=site%3Apastebin.com+intext%3A%22",
                "https://www.google.com/search?q=site%3Alocatefamily.com+intext%3A%22",
                "https://www.google.com/search?q=site%3Awho-called.co.uk+intext%3A%22",
                "https://www.google.com/search?q=site%3Aspytox.com+intext%3A%22"
            ]
            for(let i = 0; i< sites.length; i++){
                let site = sites[i];
                let link: string = site + numbers.international.slice(1,) + this.orIntextOne + numbers.international.slice(1,) + this.orIntextTwo + numbers.local + this.endQuotation;
                this.footprintDorks.push(link);
            }
            resolve(undefined);

        });
        return(undefined);
    }

    public async generateTemporaryDorks(numbers: NumberFormats) {
        await new Promise((resolve) => {
            let sites: String[] = [
                "https://www.google.com/search?q=site%3Areceive-sms-now.com+intext%3A%22",
                "https://www.google.com/search?q=site%3Agetfreesmsnumber.com+intext%3A%22",
                "https://www.google.com/search?q=site%3Asellaite.com+intext%3A%22",
                "https://www.google.com/search?q=site%3Areceive-sms-online.info+intext%3A%22",
                "https://www.google.com/search?q=site%3Areceive-a-sms.com+intext%3A%22",
                "https://www.google.com/search?q=site%3Asms-receive.net+intext%3A%22"
            ]
            for(let i = 0; i< sites.length; i++){
                let site = sites[i];
                let link: string = site + numbers.international.slice(1,) + this.orIntextOne + numbers.international.slice(1,) + this.orIntextTwo + numbers.local + this.endQuotation;
                this.temporaryDorks.push(link);
            }
            resolve(undefined);

        });
        return(undefined);
    }
}