import { NumberFormats } from "../../../models/NumberFormats";
import { StreamTag } from "../../../types/StreamTag";
import { Stream } from "../Stream";

export class PhoneNumberStream extends Stream {

    protected tags: StreamTag[] = ["phone-number"];

    protected formattedNumbers: NumberFormats;
    
    constructor(query: string) { super(query); }
<<<<<<< HEAD
=======

    public async reformatNumber(number: string) {
        // CODE TO REFORMAT PHONE NUMBERS INTO POSSIBLE FORMATS (LOCAL AND INTERNATIONAL)
        
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
>>>>>>> origin/name-stream

            } else {
                formatted.local = number;
                formatted.international = number;
                resolve(undefined);
            }
        });
        this.formattedNumbers = formatted;
        return(this.formattedNumbers);
    }
}