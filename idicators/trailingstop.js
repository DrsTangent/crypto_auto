class TrailingStop{
    constructor(coinPrice, leverage, direction, startingPercentage, diffPercentage){
        this.direction = direction;
        this.trailingStartValue = this.getMultiplier(leverage, direction,  startingPercentage) * coinPrice;
        this.exetremeCoinPrice = coinPrice;
        this.tralingStopValue = 0;
        this.diffPercentage = diffPercentage;
        this.leverage = leverage;
        this.isTriggered = false;
    }
    getMultiplier(leverage, direction, percentage){
        let multiplier = 1;
        let percentageMultiplier = percentage/100;
        if(direction == "long"){
            multiplier = ((leverage + percentageMultiplier)/leverage)
        }
        else if(direction == "short"){
            multiplier = ((leverage - percentageMultiplier)/leverage)
        }

        return multiplier
    }
    update(newCoinPrice){
        if(this.direction == "long"){
            if(this.exetremeCoinPrice < newCoinPrice){
                this.exetremeCoinPrice = newCoinPrice
                this.tralingStopValue = (100 - ((1/this.leverage)*this.diffPercentage))*this.exetremeCoinPrice / 100;
            }
        }
        else if(this.direction == "short") {
            if(this.exetremeCoinPrice > newCoinPrice){
                this.exetremeCoinPrice = newCoinPrice
                this.tralingStopValue = (100 + ((1/this.leverage)*this.diffPercentage))*this.exetremeCoinPrice / 100;
            }
        }
        
    }
    updateCoinPrice(coinPrice){
        let  decision = "continue";
        this.update(coinPrice);
        if(!this.isTriggered){
            if(this.direction == "long"){
                if(coinPrice>=this.trailingStartValue){
                    this.isTriggered=true;
                }
            }
            else if(this.direction == "short")
            {
                if(coinPrice<=this.trailingStartValue){
                    this.isTriggered=true;
                }
            }
        }
        else{
            if(this.direction == "long"){
                if(coinPrice<=this.tralingStopValue){
                    decision = "take";
                }
            }
            else if(this.direction == "short"){
                if(coinPrice>=this.tralingStopValue){
                    decision = "take";
                }
            }
        }
        return decision;
    }
}

module.exports = {TrailingStop}