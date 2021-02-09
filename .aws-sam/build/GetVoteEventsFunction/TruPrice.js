const ethers = require("ethers");
const connect = require("./utils/providers");
const contracts = require("./utils/constants");

const [, , wallet] = connect();

const abi = ['function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)'];

const getEthPrice = async () => {
    const uniswapEthUsdc = new ethers.Contract(contracts.uniswapEthUsdc, abi, wallet);
    const reserves = await uniswapEthUsdc.getReserves();
    const res0 = reserves["_reserve0"] / 1e6;
    const res1 = reserves["_reserve1"] / 1e18;
    const price = res0 / res1;
    return price;
}

exports.getTruPrice = async (event) => {
    const uniswapEthTru = new ethers.Contract(contracts.uniswapEthTru, abi, wallet);
    const reserves = await uniswapEthTru.getReserves();
    const res0 = reserves["_reserve0"] / 1e8;
    const res1 = reserves["_reserve1"] / 1e18;
    const priceInEth = res1 / res0;
    const ethPrice = await getEthPrice();
    const priceInUsd = priceInEth * ethPrice;
    const poolValue = res0 * priceInUsd + res1 * ethPrice;

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "text/plain",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            truPrice: {
                priceInEth: priceInEth,
                priceInUsd: priceInUsd,
                poolValue: poolValue
            }
        })
    };
}