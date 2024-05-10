const { default: axios } = require("axios");
const { Candle } = require("./idicators/candles");
const { SuperTrendIndicator } = require("./idicators/supertrend");


function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
  }

async function start(coinName, timeFrame){
    let res = await axios.get(`https://data-api.binance.vision/api/v3/klines?symbol=${coinName.toUpperCase()}&interval=${timeFrame}&limit=1500`)
    let data = await res.data;
    let candles = data.map((arr)=>{
        let candle  = new Candle(coinName, parseFloat(arr[1]), parseFloat(arr[3]),
            parseFloat(arr[2]),parseFloat(arr[4]),arr[0],arr[6])
        return candle;
    })
    let firstRows = candles.slice(0, 11);
    this.supertrendIndicator = new SuperTrendIndicator(10, 3, firstRows);

    let currIndication = "short";
    let count = 1;
    for(let i = 11; i<candles.length; i++){
        let indication = this.supertrendIndicator.addCandle(candles[i]);
        if(indication != currIndication){
            console.log(count++, " ****", indication, "******");
            console.log(candles[i].start_time);
            console.log(timeConverter(candles[i].start_time/1000));
            currIndication = indication;
        }
    }
}

start('UNIUSDT', '15m')