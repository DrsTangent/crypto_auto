const { WebsocketStream } = require('@binance/connector')
const { Console } = require('console');
const { Candle } = require('../idicators/candles');
const { default: axios } = require('axios');
const logger = new Console({ stdout: process.stdout, stderr: process.stderr })


class Market{
    constructor(timeFrame){
        if(Market.instance !=  undefined){
            return Market.instance;
        }
        Market.coins = []

        // define callbacks for different events
        const callbacks = {
            open: () => logger.debug('Market has been connected with Websocket Server'),
            close: () => logger.debug('Market has disconnected from Websocket Server'),
            message: (data) => {
                let jsonData = JSON.parse(data);
                Market.coins.forEach(coin => {
                    if(coin.coinName.toLowerCase() == jsonData['s'].toLowerCase()){
                        coin.updateCoinPrice(parseFloat(jsonData['k']['c']))
                        let coinCandle = new Candle(jsonData['s'], parseFloat(jsonData['k']['o']), parseFloat(jsonData['k']['l']), 
                        parseFloat(jsonData['k']['h']), parseFloat(jsonData['k']['c']), parseFloat(jsonData['k']['t']),
                        parseFloat(jsonData['k']['T']))
                        coin.updateCoinCandle(coinCandle);
                    }
                });
            }
        }
        this.timeFrame = timeFrame;
        this.websocketStreamClient = new WebsocketStream({ logger, callbacks })
        Market.instance = this;
    }

    async getCoin(coinJson){
        let coinName = coinJson['coinName'];
        let minQty = coinJson['minQty'];
        for(let i = 0; i<Market.coins.length; i++){
            if(Market.coins[i].coinName.toLowerCase() == coinName.toLowerCase()){
                return Market.coins[i];
            }
        }
        let symbols = await this.getSymbols();
        let symbol = symbols.find((element)=>{
            return element['symbol'].toLowerCase() == coinName.toLowerCase()
        })
        let coin = new Coin(coinName, symbol['quantityPrecision'], minQty)
        this.websocketStreamClient.subscribe(`${coinName}@kline_${this.timeFrame}`)
        Market.coins.push(coin);
        return coin;
    }

    async getSymbols(){
        if(this.symbols != undefined)
                return this.symbols;
        let res = await axios.get('https://fapi.binance.com/fapi/v1/exchangeInfo')
        this.symbols = await res.data['symbols']
        return this.symbols;
    }
}

class Coin{
    constructor(coinName, quantityPrecision, minQty){
        this.candleAttachees = []
        this.priceAttaches = []
        this.minQty = minQty
        this.coinName = coinName;
        this.quantityPrecision = quantityPrecision;
    }

    updateCoinPrice(newCoinPrice){
        this.coinPrice = newCoinPrice;
        this.priceAttaches.forEach((coinListener)=>{
            coinListener.updateCoinPrice(newCoinPrice);
        })
    }

    attachForPrice(priceAttachment){
        this.priceAttaches.push(priceAttachment);
    }

    attachForCandle(candleAttachment){
        this.candleAttachees.push(candleAttachment);
    }

    updateCoinCandle(newCoinCandle){
        this.coinCandle = newCoinCandle
        this.priceAttaches.forEach((candleListener)=>{
            candleListener.updateCoinCandle(newCoinCandle);
        })
    }
}

module.exports = {Market, Coin}
