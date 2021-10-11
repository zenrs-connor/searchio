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

export const DOMAIN = /^(https:\/\/)?[a-zA-Z0-9-.]{1,61}(\/)?$/;

export const BUSINESS = /^(?!\s)(?!.*\s$)(?=.*[a-zA-Z0-9])[a-zA-Z0-9 '~?!.&]{2,}$/;