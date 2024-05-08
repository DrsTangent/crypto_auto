const { Candle } = require("../idicators/candles");
const { StopLoss } = require("../idicators/stoploss");
const { SuperTrendIndicator } = require("../idicators/supertrend");
const { TrailingStop } = require("../idicators/trailingstop");
const axios = require('axios');
class SuperTrendStrategy{
    constructor(client, coin, amount, timeFrame, leverage, tradingDirection, stopLossPercentage, trailingStartPercentage, diffPercentage){
        console.log(`Super Trend Strategy (${coin.coinName})\nAmount:${amount}\nLeverage:${leverage}\nDirection:${tradingDirection}`)
        this.client = client;
        this.coin = coin;
        this.amount = amount;
        this.boughtCoins = 0;
        this.leverage = leverage;
        this.previousSuperTrend = null; 
        this.stopLoss = null;
        this.trailingStop = null;
        this.supertrendIndicator = null;
        this.tradingDirection = tradingDirection; // short/long/bi
        this.tradeDirection = null // if no trade then null, "up"  / "down"
        this.isTradeSet = false;
        this.lockTrade = false;
        this.timeFrame = timeFrame;

        //Stop Loss, Trailing Stop, Difference Percentage
        this.stopLossPercentage = stopLossPercentage;
        this.trailingStartPercentage = trailingStartPercentage;
        this.diffPercentage = diffPercentage

        coin.attachForPrice(this);
        coin.attachForCandle(this);
    }

    async start(){
        let res = await axios.get(`https://data-api.binance.vision/api/v3/klines?symbol=${this.coin.coinName.toUpperCase()}&interval=${this.timeFrame}`)
        let data = await res.data;
        let candles = data.map((arr)=>{
            let candle  = new Candle(this.coin.coinName, parseFloat(arr[1]), parseFloat(arr[3]),
                parseFloat(arr[2]),parseFloat(arr[4]),arr[0],arr[6])
            return candle;
        })
        let firstRows = candles.slice(0, 11);
        this.supertrendIndicator = new SuperTrendIndicator(10, 3, firstRows);

        for(let i = 11; i<candles.length; i++){
            this.supertrendIndicator.addCandle(candles[i]);
        }
    }

    placeTrade(direction){
        if(this.tradeDirection != null || this.lockTrade)
            return;
        this.lockTrade = true;

        let side = direction == "long"?"BUY":"SELL";

        console.log(`Opening Trade of ${this.coin.coinName}`)

        this.client.amountTrade(this.coin, this.leverage, this.amount, side).then((orderDetails)=>{
            console.log(orderDetails);
            this.amount = this.amount + orderDetails.profit;
            this.boughtCoins = orderDetails.qty;
            this.tradeDirection = direction;
            this.stopLoss = new StopLoss(parseFloat(orderDetails['price']), this.leverage, direction, this.stopLossPercentage);
            this.trailingStop = new TrailingStop(parseFloat(orderDetails['price']), this.leverage, direction, this.trailingStartPercentage, this.diffPercentage);
            this.lockTrade = false;

            console.log(this.stopLoss);
            console.log(this.trailingStop);

        }).catch((e)=>{
            console.log('Error Occurred While Opening Trade');
            console.log(e);
        })
        
    }

    takeTrade(direction){
        if(this.tradeDirection == null || this.lockTrade)
            return;
        this.lockTrade = true;

        let side = direction == "long"?"SELL":"BUY";
        console.log(`Closing Trade of ${this.coin.coinName}`)
        this.client.quantityTrade(this.coin, this.boughtCoins, side).then((orderDetails)=>{  
            console.log('')
            this.amount = this.amount + orderDetails.profit;
            this.boughtCoins = 0;
            this.tradeDirection = null;
            this.stopLoss = null;
            this.trailingStop = null;
            this.lockTrade = false;
        }).catch((e)=>{
            console.log('Error Occurred While Closing Trade');
            console.log(e);
        })
        
    }

    updateCoinPrice(coinPrice){
        if(this.lockTrade)
            return;
        if(this.stopLoss != null){
            let decision = this.stopLoss.updateCoinPrice(coinPrice);
            if(decision == "take"){
                console.log(`Stop Loss Triggered [${this.coin.coinName}@${coinPrice}]`)
                this.takeTrade(this.tradeDirection);
            }
        }
        if(this.trailingStop != null){
            let decision = this.trailingStop.updateCoinPrice(coinPrice);
            if(decision == "take"){
                console.log(`Trailing Stop Triggered [${this.coin.coinName}@${coinPrice}]`)
                this.takeTrade(this.tradeDirection);
            }
        }
    }

    updateCoinCandle(coinCandle){
        if(this.supertrendIndicator != null){
            let indication = this.supertrendIndicator.addCandle(coinCandle);
            if(this.previousSuperTrend == null || this.previousSuperTrend == indication){
                this.previousSuperTrend = indication;
                return;
            }
            if(this.lockTrade)
                return

            console.log(`\n****${coinCandle.currency}****\nEntry:${indication}\nCoin Price:${coinCandle.close}\nTrade`)

            if(this.tradeDirection == null){
                if(indication == "long" && (this.tradingDirection == "long" || this.tradingDirection == "bi")){
                    this.placeTrade("long");
                }
                else if(indication == "short"  && (this.tradingDirection == "short" || this.tradingDirection == "bi")){
                    this.placeTrade("short");
                }
            }
            else if(this.tradeDirection == "long"){
                if(indication == "short"){
                    this.takeTrade("long");
                    return;
                }
            }
            else if(this.tradeDirection == "short"){
                if(indication == "long"){
                    this.takeTrade("short");
                    return;
                }
            }
            
            this.previousSuperTrend = indication;
        }
    }
}

module.exports = {SuperTrendStrategy}