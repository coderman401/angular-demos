import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
    name: 'highlight'
})

export class HighlighTextPipe implements PipeTransform {

    transform(value: any, search: string) {
        if (search.length >= 3) {
            const final = value.split(search).join('<span class="highlighted">' + search + '</span>');
            return final;
        }
        return value;
    }


}
