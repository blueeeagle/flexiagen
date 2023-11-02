export { } // this will make it module

declare global{ // this is important to access it as global type String

    interface String {
        stringToFloat(): Number;
        toTitleCase(): string;
        toHours(): any;
    }

    interface Number {
        stringToFloat(): Number;
        toINR(): string;
        toHours(): any;
    } 

}

Number.prototype.toINR = function () {
    const d = (this || 0).toString().replace(/(\d+?)(?=(\d\d)+(\d)(?!\d))(\.\d+)?/g, "$1,");
    const b = '\u20B9';
    return b.concat(d);
};

Number.prototype.toHours = function () {

    const num: any = this || 0;

    return (num % 1 == 0) ? this : Math.floor(num) +':'+ Math.round((num % 1) * 60).toString().padStart(2,'0')

}

String.prototype.toHours = function () {

    const num: any = parseFloat(this.toString()) || 0;

    return (num % 1 == 0) ? this : Math.floor(num) +':'+ Math.round((num % 1) * 60).toString().padStart(2,'0')

}

String.prototype.stringToFloat = function (): Number {

    return parseFloat((this.toString()).replace(/,/g, '') || '0');

}

Number.prototype.stringToFloat = function (): Number {

    return parseFloat(this.toString() || '0');

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