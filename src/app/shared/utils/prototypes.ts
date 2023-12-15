export { } // this will make it module

declare global{ // this is important to access it as global type String

    interface String {
        toTitleCase(): string;
        toCustomFixed(digits?: number): string;
    }

    interface Number {
        toCustomFixed(digits?: number): string;
    } 

}

String.prototype.toTitleCase = function () {
    
    var words = this.split(' ')

    var array = []

    for (var i = 0; i < words.length; i++) {

        var word = words[i]

        array.push(word.charAt(0).toUpperCase() + word.slice(1))

    }

    return array.join(' ');

}

String.prototype.toCustomFixed = function (digits?: number) {

    let currencyDetails = JSON.parse(sessionStorage.getItem('CurrencyDetails') || '{}');

    let value = this.replace(/[^0-9.]*/g,''); // remove all non numeric characters except dot

    return parseFloat(value).toFixed(digits || currencyDetails['decimalPoints'] || 3);

}

Number.prototype.toCustomFixed = function (digits?: number) {

    let currencyDetails = JSON.parse(sessionStorage.getItem('CurrencyDetails') || '{}');

    return parseFloat(this.toString()).toFixed(digits || currencyDetails['decimalPoints'] || 3);

}