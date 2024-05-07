const { Market } = require("./Market/market");


async function coinTest(){
    let market = new Market('1m');

    let coin1 = await market.getCoin('uniusdt');
}

coinTest();