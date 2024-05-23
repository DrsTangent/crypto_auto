const { default: axios } = require("axios");
const { Market } = require("./Market/market");
const { Candle } = require("./idicators/candles");
const { SuperTrendIndicator } = require("./idicators/supertrend");

let coinsJson = {
    "ltcusdt": {
        "coinName": "ltcusdt",
        "minQty": 0.254
    },
    "xrpusdt": {
        "coinName": "xrpusdt",
        "minQty": 9.4
    },
    "seiusdt": {
        "coinName": "seiusdt",
        "minQty": 10
    },
    "suiusdt": {
        "coinName": "suiusdt",
        "minQty": 4.5
    },
    "uniusdt": {
        "coinName": "uniusdt",
        "minQty": 1
    },
    "1000pepeusdt": {
        "coinName": "1000pepeusdt",
        "minQty": 338
    },
    "rndrusdt": {
        "coinName": "rndrusdt",
        "minQty": 0.5
    },
    "aaveusdt": {
        "coinName": "aaveusdt",
        "minQty": 0.1
    },
    "roseusdt": {
        "coinName": "roseusdt",
        "minQty": 57
    },
    "fetusdt": {
        "coinName": "fetusdt",
        "minQty": 3
    }
    ,
    "sushiusdt": {
        "coinName": "sushiusdt",
        "minQty": 5
    },
    "vanryusdt": {
        "coinName": "vanryusdt",
        "minQty": 28
    },
    "linkusdt": {
        "coinName": "linkusdt",
        "minQty": 1.21
    },
    "bomeusdt": {
        "coinName": "bomeusdt",
        "minQty": 390
    },
    "solusdt": {
        "coinName": "solusdt",
        "minQty": 1
    },
    "adausdt": {
        "coinName": "adausdt",
        "minQty": 11
    },
    "ethusdt": {
        "coinName": "ethusdt",
        "minQty": 0.006
    },
    "ordiusdt": {
        "coinName": "ordiusdt",
        "minQty": 0.2
    },
    "wifusdt": {
        "coinName": "wifusdt",
        "minQty": 1.8
    },
    "btcusdt": {
        "coinName": "btcusdt",
        "minQty": 0.002
    },
    "1000bonkusdt": {
        "coinName": "1000bonkusdt",
        "minQty": 141
    },
    "nfpusdt": {
        "coinName": "nfpusdt",
        "minQty": 10.8
    },
    "aceusdt": {
        "coinName": "aceusdt",
        "minQty": 0.93
    },
    "trbusdt": {
        "coinName": "trbusdt",
        "minQty": 0.1
    },
    "runeusdt": {
        "coinName": "runeusdt",
        "minQty": 1
    },
    "unfiusdt": {
        "coinName": "unfiusdt",
        "minQty": 1
    },
    "magicusdt": {
        "coinName": "magicusdt",
        "minQty": 6.6
    },
    "maticusdt": {
        "coinName": "maticusdt",
        "minQty": 7
    },
}

async function coinTest(coinObj){
    //let market = new Market('1m');

    //let coin1 = await market.getCoin(coinObj);

    let res = await axios.get(`https://fapi.binance.com/fapi/v1/klines?symbol=${coinObj["coinName"].toUpperCase()}&interval=1m&limit=1500`)
    console.log(res.data.length)
    let data = await res.data;
    let candles = data.map((arr)=>{
        let candle  = new Candle(coinObj['coinName'], parseFloat(arr[1]), parseFloat(arr[3]),
            parseFloat(arr[2]),parseFloat(arr[4]),arr[0],arr[6])
        
        return candle;
    })
    let firstRows = candles.slice(0, 11);
    this.supertrendIndicator = new SuperTrendIndicator(10, 3, firstRows);

    for(let i = 11; i<candles.length; i++){
        this.supertrendIndicator.addCandle(candles[i]);
        console.log(candles[i])
    }
    return res.data.length == 1500

}

async function test(){
    for(let i = 0; i<Object.keys(coinsJson).length; i++){
        let coinName = Object.keys(coinsJson)[i]
        let coinObj = coinsJson[coinName]

        let result = await coinTest(coinObj);

        console.log(coinName, " ", result);
    }
}

test()