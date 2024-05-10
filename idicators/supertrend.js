class SuperTrendIndicator{
    constructor(atrNum, multiplier,candles){
        this.candles = candles.slice(Math.max(candles.length - (atrNum + 1), 1)) // Getting Last Values
        this.atrNum = atrNum
        this.multiplier = multiplier
        this.prevAtr = null;
        this.atr = null
        this.prevUpperBand = null
        this.prevLowerBand = null
        this.prevClose = null;
        this.prevTrendDirection = "short";
        this.trendDirection = "short";
        this.superTrend = null
        //Calculate ATR
        this.calculateATR();
    }
    addCandle(candle){
        let topCandle = this.candles[this.candles.length - 1];
        let removingTrueRange = 0;
        if(topCandle.start_time == candle.start_time){
            let poppedCandle = this.candles.pop();
            removingTrueRange = poppedCandle.getTrueRange(this.candles[this.candles.length-1]);
            this.candles.push(candle);
        }
        else{
            this.prevTrendDirection = this.trendDirection;
            this.prevAtr = this.atr; // new line
            removingTrueRange = this.candles[1].getTrueRange(this.candles[0]);
            this.candles.shift()
            this.candles.push(candle);
        }
        
        let trueRangeToBeAdded = this.candles[this.candles.length - 1].getTrueRange(this.candles[this.candles.length - 2])
        //let prevTotalSum = this.atr * this.atrNum;
        //let newTotalSum = prevTotalSum - removingTrueRange + trueRangeToBeAdded;
        //this.atr = newTotalSum/this.atrNum;
        this.atr = (this.prevAtr*(this.atrNum - 1) + trueRangeToBeAdded)/ this.atrNum
        let hl2 = (candle.high + candle.low) / 2
        let basicUpperBand = hl2 + (this.multiplier * this.atr)    
        let basicLowerBand = hl2 - (this.multiplier * this.atr)
        let finalUpperBand = basicUpperBand;
        let finalLowerBand = basicLowerBand; 
        if(this.prevUpperBand != null){
            finalUpperBand = (basicUpperBand < this.prevUpperBand || this.prevClose > this.prevUpperBand)?basicUpperBand:this.prevUpperBand;
        }
        if(this.prevLowerBand != null){
            finalLowerBand = (basicLowerBand > this.prevLowerBand || this.prevClose < this.prevLowerBand)?basicLowerBand:this.prevLowerBand;
        }

        if(this.superTrend == this.prevUpperBand){
            this.trendDirection = candle.close > finalUpperBand? "long": "short";
        }
        else{
            this.trendDirection = candle.close < finalLowerBand ? "short" : "long";
        }
        this.superTrend = this.trendDirection == "long" ? finalLowerBand : finalUpperBand
        this.prevLowerBand = finalLowerBand
        this.prevUpperBand = finalUpperBand
        this.prevClose = candle.close;
        return this.prevTrendDirection;
    }
    calculateATR(){
        let trueRangeSum = 0;
        for(let i = 1; i<this.candles.length; i++){
            trueRangeSum+= this.candles[i].getTrueRange(this.candles[i-1]);
        }
        this.atr = trueRangeSum/(this.candles.length - 1);
        this.prevAtr = trueRangeSum/(this.candles.length - 1);
    }
}

module.exports = {SuperTrendIndicator}