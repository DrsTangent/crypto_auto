const axios = require('axios')
const crypto = require('crypto');

class FutureConnector{
    constructor(apiKey, secretKey, recvWindow=5000){
        this.apiKey = apiKey;
        this.secretKey = secretKey;
        this.recvWindow = recvWindow;
        this.axiosInstance = axios.create({
            baseURL: 'https://fapi.binance.com/',
            timeout: 5000,
            headers: {'X-MBX-APIKEY': apiKey}
        });
    }

    async makeSignedQueryRequest(endpoint, query){
        let signature = getSHAKey(query);
    }

    async makeSignedBodyRequest(endpoint, body){
        const queryString = new URLSearchParams(body).toString();
        let signature = getSHAKey(queryString);

    }

    requestTimeStamp(){
        return (new Date()).getTime()
    }

    getSHAKey(query){
        var hmac = crypto.createHmac('sha256', this.secretKey);
    
        let data = hmac.update(query);
    
        let gen_hmac = data.digest('hex');
    
        return gen_hmac;
    }

    async getAccountInformation(){
        let timeStamp = this.requestTimeStamp();
        let query = `recvWindow=${this.recvWindow}&timestamp=${timeStamp}`
        let signature = this.getSHAKey(query)
        let res = await this.axiosInstance.get(`/fapi/v2/account?${query}&signature=${signature}`)
        let data = await res.data
        return data;
    }

    async placeOrder(coin, quantity, side){
        let timeStamp = this.requestTimeStamp();
        let jsonObj = {
            "symbol": coin,
            "side": side,
            "type": "MARKET",
            "quantity": quantity,
            "recvWindow": this.recvWindow,
            "timestamp": timeStamp
        }
        const queryString = new URLSearchParams(jsonObj).toString();
        let signature = this.getSHAKey(queryString);

        let res =  await this.axiosInstance.post(`/fapi/v1/order?${queryString}&signature=${signature}`)

        let data = await res.data

        return data;
    }

    async getTrade(orderId){

    }

    async getMyTrades(symbol){
        let timeStamp = this.requestTimeStamp();
        let query = `recvWindow=${this.recvWindow}&timestamp=${timeStamp}&symbol=${symbol}`
        let signature = this.getSHAKey(query)
        let res = await this.axiosInstance.get(`/fapi/v1/order?${query}&signature=${signature}`)
        let data = await res.data

        return data
    }

    async cancelMyTrades(symbol){
        let timeStamp = this.requestTimeStamp();
        let query = `recvWindow=${this.recvWindow}&timestamp=${timeStamp}&symbol=${symbol}`
        let signature = this.getSHAKey(query)
        let res = await this.axiosInstance.delete(`/fapi/v1/allOpenOrders?${query}&signature=${signature}`)
        let data = await res.data

        return data
    }

    async getPositions(){
        let timeStamp = this.requestTimeStamp();
        let query = `recvWindow=${this.recvWindow}&timestamp=${timeStamp}`
        let signature = this.getSHAKey(query)
        let res = await this.axiosInstance.get(`/fapi/v2/positionRisk?${query}&signature=${signature}`)
        let data = await res.data
        return data;
    }

    async getAllActivePositions(){
        let timeStamp = this.requestTimeStamp();
        let query = `recvWindow=${this.recvWindow}&timestamp=${timeStamp}`
        let signature = this.getSHAKey(query)
        let res = await this.axiosInstance.get(`/fapi/v2/positionRisk?${query}&signature=${signature}`)
        let data = await res.data
        let activePositions = data.filter((position)=>{return parseFloat(position.positionAmt) != 0})
        return activePositions;
    }

    async getOrderDetails(orderId){
        let timeStamp = this.requestTimeStamp();
        let query = `orderId=${orderId}&recvWindow=${this.recvWindow}&timestamp=${timeStamp}`
        let signature = this.getSHAKey(query)
        let res = await this.axiosInstance.get(`/fapi/v1/userTrades?${query}&signature=${signature}`)
        let data = await res.data

        //Trade Json Object
        let tradeObj = {
            symbol: data[0].symbol,
            side: data[0].side,
            orderId: data[0].orderId,
            price: data[0].price,
            qty:0,
            realizedPnl: 0,
            commission: 0,
            quoteQty: 0,
            time: data[0].time
        }

        for(let i = 0; i<data.length; i++){
            tradeObj.qty+=parseFloat(data[i].qty);
            tradeObj.realizedPnl+=parseFloat(data[i].realizedPnl);
            tradeObj.commission+=parseFloat(data[i].commission);
            tradeObj.quoteQty+=parseFloat(data[i].quoteQty);
        }

        tradeObj.profit = tradeObj.realizedPnl - tradeObj.commission;

        return tradeObj;
    }

    async changeLeverage(coinName, leverage){
        let timeStamp = this.requestTimeStamp();
        let query = `symbol=${coinName}&leverage=${leverage}&recvWindow=${this.recvWindow}&timestamp=${timeStamp}`
        let signature = this.getSHAKey(query)
        let res = await this.axiosInstance.post(`/fapi/v1/leverage?${query}&signature=${signature}`)
        let data = await res.data
        return data;
    }

    async changeMarginType(coinName, marginType){
        let timeStamp = this.requestTimeStamp();
        let query = `symbol=${coinName}&marginType=${marginType}&recvWindow=${this.recvWindow}&timestamp=${timeStamp}`
        let signature = this.getSHAKey(query)
        let res = await this.axiosInstance.post(`/fapi/v1/marginType?${query}&signature=${signature}`)
        let data = await res.data
        return data;
    }
}

module.exports = {FutureConnector}