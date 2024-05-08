class StopLoss{
    constructor(coinPrice, leverage, direction, percentage){
        this.direction = direction;
        this.stopLossPrice = this.getMultiplier(leverage, direction,  percentage) * coinPrice;
    }
    getMultiplier(leverage, direction, percentage){
        let multiplier = 1;
        let percentageMultiplier = percentage/100;
        if(direction == "long"){
            multiplier = ((leverage - percentageMultiplier)/leverage)
        }
        else if(direction == "short"){
            multiplier = ((leverage + percentageMultiplier)/leverage)
        }

        return multiplier
    }
    
    updateCoinPrice(coinPrice){
        let  decision;
        if(this.direction == "long"){
            decision = (coinPrice<=this.stopLossPrice)?"take":"continue";
        }
        else if(this.direction == "short")
        {
            decision = (coinPrice>=this.stopLossPrice)?"take":"continue";
        }

        return decision;
    }
}

module.exports = {StopLoss}