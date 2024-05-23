const { Market } = require("./Market/market");
const { BinanceClient } = require("./client/Binance-Client");


//3O3NAsdJBkSf6iMiIrLMOknh3BWDbKJeYlHmrq7GXpF1EM3YWroZqYaibT9sx0yX
//eckl9XPymuvDeZDUv2KRZfhhV3MvzSxndD1TCd06tIbsok5qr2OI247hzTtbdwIb

const inquirer = require('inquirer');

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
    }
}

function displayMenu() {
    console.log("Welcome! Please enter the following information:\n");

    inquirer
        .prompt([
            {
                type: 'list',
                name: 'tradingDirection',
                message: 'Trading Direction:',
                choices: ['bi', 'long', 'short']
            },
            {
                type: 'list',
                name: 'leverage',
                message: 'Leverage:',
                choices: [2, 5, 7, 20, 50]
            },
            {
                type: 'list',
                name: 'timeFrame',
                message: 'Time Frame:',
                choices: ['1m', '5m', '15m', '1h', '4h']
            },
            {
                type: 'input',
                name: 'stopLossPercentage',
                message: 'Stop Loss Percentage:'
            },
            {
                type: 'input',
                name: 'trailingStopPercentage',
                message: 'Trailing Stop Percentage:'
            },
            {
                type: 'input',
                name: 'diffPercentage',
                message: 'Difference Percentage:'
            },
            {
                type: 'checkbox',
                name: 'coins',
                message: 'Select Coins:',
                choices: Object.keys(coinsJson)
            }
        ])
        .then(async (answers) => {

            answers.apiKey = '3O3NAsdJBkSf6iMiIrLMOknh3BWDbKJeYlHmrq7GXpF1EM3YWroZqYaibT9sx0yX';
            answers.secretKey = 'eckl9XPymuvDeZDUv2KRZfhhV3MvzSxndD1TCd06tIbsok5qr2OI247hzTtbdwIb';
            console.log("\nThank you for providing the information:");
            console.log("API Key:", answers.apiKey);
            console.log("Secret Key:", answers.secretKey);
            console.log("Trading Direction:", answers.tradingDirection);
            console.log("Leverage:", answers.leverage);
            console.log("Time Frame:", answers.timeFrame);
            console.log("Stop Loss Percentage:", answers.stopLossPercentage);
            console.log("Trailing Stop Percentage:", answers.trailingStopPercentage);
            console.log("Difference Percentage:", answers.diffPercentage);
            console.log("Selected Coins:", answers.coins.join(', '));

            let market = new Market(answers.timeFrame);

            let bc = new BinanceClient( answers.apiKey, answers.secretKey, answers.tradingDirection, 
                answers.leverage, answers.timeFrame, answers.stopLossPercentage, 
                answers.trailingStopPercentage, answers.diffPercentage);

            let coins = [];

            for(let i = 0; i<answers.coins.length; i++){
                let coin = await market.getCoin(coinsJson[answers.coins[i]]);
                coins.push(coin)
            }

            bc.setCoins(coins);

            //Wait 10-15 Saconds//
            setTimeout(()=>{
                bc.startTrading()
            }, 30000)
        });
}

displayMenu();



// let bc = new BinanceClient( apiKey, secretKey, tradingDirection, leverage, timeFrame, stopLossPercentage, tralingStopPercentage, diffPercentage);


// let market = new Market(timeFrame)



// market.getCoin('wusdt').then(
//     (coin)=>{
//         bc.setCoins([coin])
//         setTimeout(()=>{bc.startTrading()}, 5000);
//     }
// );

