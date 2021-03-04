const ethers = require("ethers");
const connect = require("/opt/nodejs/providers");
const contracts = require("/opt/nodejs/constants");

const [, provider, wallet] = connect();

const abi = ['function totalSupply() public view returns (uint256)', 'function poolValue() public view returns (uint256)', 'event Borrow(address borrower, uint256 amount, uint256 fee)'];
const tfi = new ethers.Contract(contracts.tfi, abi, wallet);

exports.getPoolValues = async (event) => {
    let totalSupply = await tfi.totalSupply() / 1e18;
    let poolValue = await tfi.poolValue() / 1e18;

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "text/plain",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            poolValues: {
                totalSupply: totalSupply,
                poolValue: poolValue
            }
        })
    };
}