class Candle{
    constructor(currency, open, low, high, close, start_time, end_time){
        this.currency = currency
        this.open = open
        this.low = low
        this.high = high
        this.close = close
        this.start_time = start_time
        this.end_time = end_time
    }
    getTrueRange(prevCandle){
        if(prevCandle.close == undefined){
            return null; 
        }
        let range1 = this.high - this.low;
        let range2 = this.high - prevCandle.close;
        let range3 = this.low - prevCandle.close;

        return Math.max(range1, range2, range3);
    }
    toString(){
        return `
        \rCurrency: ${this.currency}
        \rClose: ${this.close}
        `
    }
}

module.exports = {Candle}