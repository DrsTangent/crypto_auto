const { FutureConnector } = require("../binance-connectors/binance-future-connector");
const { SuperTrendStrategy } = require("../strategies/super-trend-strategies");

class BinanceClient{
    constructor(apiKey, secretKey, tradingDirection, leverage, timeFrame, stopLossPercentage, trailingStopPercentage, diffPercentage){
        this.connector = new FutureConnector(apiKey, secretKey, 5000);
        this.availableBalance = null;
        this.coins = [];
        this.strategies = [];
        this.tradingDirection = tradingDirection;
        this.leverage = leverage;
        this.timeFrame = timeFrame;
        this.stopLossPercentage = stopLossPercentage;
        this.trailingStopPercentage = trailingStopPercentage;
        this.diffPercentage = diffPercentage;

        this.connector.getAccountInformation().then((data)=>{
            //Account Information
            console.log('setting available balance: ', data['availableBalance'])
            this.availableBalance = data['availableBalance'];
        })
    }

    setCoins(coinsArray){
        this.coins = coinsArray;
    }

    async amountTrade(coin, leverage, amount, side){
        let leveragedAmount = amount*leverage
        let coinPrice = coin.coinPrice;
        let quantity = leveragedAmount/coinPrice;
        let fixedQuantity = quantity.toFixed(coin.quantityPrecision + 1).slice(0,-1);

        let orderPlacement = await this.connector.placeOrder(coin.coinName.toUpperCase(), fixedQuantity, side)

        let orderId = orderPlacement['orderId'];

        let orderDetails = await this.connector.getOrderDetails(orderId);

        return orderDetails;
    }

    async quantityTrade(coin, quantity, side){
        let orderPlacement = await this.connector.placeOrder(coin.coinName.toUpperCase(), quantity, side);

        let orderId = orderPlacement['orderId'];

        let orderDetails = await this.connector.getOrderDetails(orderId);

        return orderDetails;
    }

    async startTrading(){
        //Changing Leverage Type and Making Trading Isolated
        for(let i = 0; i<this.coins.length; i++){
            await this.connector.changeLeverage(this.coins[i].coinName, this.leverage).catch(e=>{});
            await this.connector.changeMarginType(this.coins[i].coinName, "ISOLATED").catch(e=>{});
        }
        //
        let amount = (this.availableBalance - this.availableBalance*0.05)/this.coins.length;
        for(let i = 0; i<this.coins.length; i++){
            let strategy = new SuperTrendStrategy(this, this.coins[i], amount, this.timeFrame, this.leverage, this.tradingDirection, this.stopLossPercentage, this.trailingStopPercentage, this.diffPercentage)
            this.strategies.push(strategy);
            strategy.start();
        }
    }
}

module.exports = {BinanceClient}