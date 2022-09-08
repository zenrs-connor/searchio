/*
*
*   This file contains commonly used RegEx patterns used in the application
*   Use uppercase names, with words separated by underscores
*   E.G. EMAIL_ADDRESS, PHONE_NUMBER etc.
*
*/

export const NAMES = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð '-]+$/;

export const PHONE_NUMBER = /^[+]?[(]?[0-9]?[0-9]?[0-9]?[)]?[- ]*[0-9]{4,}$/;

export const EMAIL_ADDRESS = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

export const ADDRESS = /^[A-Za-z0-9'\.\-\s\,]+$/;

export const USERNAME = /^[A-Za-z0-9]+([ _-]*[A-Za-z0-9]+)*$/;

export const REGISTRATION_PLATE = /^[A-Z0-9\s]{2,8}$/;

export const DOMAIN = /^(https?:\/\/)?[a-zA-Z0-9-.]{1,61}(\/)?$/;

export const BUSINESS = /^(?!\s)(?!.*\s$)(?=.*[a-zA-Z0-9])[a-zA-Z0-9 '~?!.&]{2,}$/;

export const IPV4 = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;

export const IPV6 = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

export const POSTCODE = /^[A-Z a-z]{1,2}[0-9]{1,2}[\s]*[0-9][A-Z a-z]{1,2}$/;

export const COORDINATES = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;

export const ANY = /^[\w\W]*$/

export const BITCOIN_ADDRESS = /^[13][a-zA-Z0-9]{27,34}$/

export const ETHEREUM_ADDRESS = /^0x[a-fA-F0-9]{40}$/

