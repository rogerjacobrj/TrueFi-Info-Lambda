const ethers = require("ethers");
const connect = require("./utils/providers");
const contracts = require("./utils/constants");

const [, , wallet] = connect();

const abi = ['function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)'];

exports.getTfiPrice = async (event) => {
    const uniswapTfi = new ethers.Contract(contracts.uniswapTusdTfi, abi, wallet);
    const reserves = await uniswapTfi.getReserves();

    const price = reserves["_reserve0"] / reserves["_reserve1"];
    const poolValue = (reserves["_reserve0"] / 1e18 + reserves["_reserve1"] / 1e18) * price;

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "text/plain",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            tfiPrice: {
                price: price,
                poolValue: poolValue
            }
        })
    };
}