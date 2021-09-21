import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalify'
})
export class CapitalifyPipe implements PipeTransform {

  transform(value: string): string {

    let str = '';

    let arr = value.split(' ');

    for(let word of arr) {
      str += `${word.charAt(0).toUpperCase()}${word.substr(1)} `;
    }

    return str.substr(0,str.length - 1);
  }

}
