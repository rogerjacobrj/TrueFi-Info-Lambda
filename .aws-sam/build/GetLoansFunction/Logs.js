const ethers = require("ethers");
const connect = require("./utils/providers");
const contracts = require("./utils/constants");

const [, provider, wallet] = connect();

exports.getLogs = async (event) => {
    let params = event.queryStringParameters;
    let { type } = params;
    let logs, logsParam;

    if (type === "loan") {
        logsParam = {
            address: contracts.loanFactory,
            topics: [ethers.utils.id("LoanTokenCreated(address)")],
            fromBlock: 11280398,
            toBlock: "latest",
        };
    } else if (type === "vote") {
        logsParam = {
            address: contracts.creditMarket,
            topics: [ethers.utils.id('Voted(address,address,bool,uint256)')],
            fromBlock: 11280398,
            toBlock: "latest"
        };
    }

    try {
        logs = await provider.getLogs(logsParam);
    } catch (error) {
        console.log(err);
        return err;
    }

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            logs: logs,
        }),
    };
};