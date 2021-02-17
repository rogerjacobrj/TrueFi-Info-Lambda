const eventHelper = require("/opt/nodejs/eventHelper");
// const eventHelper = require("./eventHelper");
const logsHelper = require("/opt/nodejs/logs");
// const logsHelper = require("./logs");
const arrayHelper = require("/opt/nodejs/arrayHelper");
// const arrayHelper = require("./arrayHelper");
const compositionLogs = require("/opt/nodejs/compositionLogs");
// const compositionLogs = require("./compositionLogs");
const tokenHelper = require("/opt/nodejs/tokenHelper");
// const tokenHelper = require("./tokenHelper");

const ethers = require("ethers");
const connect = require("/opt/nodejs/providers");
const contracts = require("/opt/nodejs/constants");

const tusdAbi = [
    "event Transfer(address indexed src, address indexed dst, uint val)",
    "event Funded(address indexed loanToken, uint256 amount)",
    "function totalSupply() public view returns (uint256)",
    "event LoanTokenCreated(address contractAddress)"
];

const [, provider, wallet] = connect();

exports.index = async (event) => {
    let totalLoanHistoricalBal = [];
    let loanTokenNameSet = new Set();

    const tusdOutLogs = await compositionLogs.tusdOutLogs();
    const tusdInLogs = await compositionLogs.tusdInLogs();

    const curveOutLogs = await compositionLogs.curveOutLogs();
    const curveInLogs = await compositionLogs.curveInLogs();

    const tusdArray = arrayHelper.mergeArray([
        ...await eventHelper.getEvents("filter", tusdOutLogs, null, -1),
        ...await eventHelper.getEvents("filter", tusdInLogs, null, 1)
    ]);

    const curveArray = arrayHelper.mergeArray([
        ...await eventHelper.getEvents("filter", curveOutLogs, null, -1),
        ...await eventHelper.getEvents("filter", curveInLogs, null, 1)
    ]);

    let processedTusdArray = arrayHelper.processArray(tusdArray, "TUSD");
    let processedCurveArray = arrayHelper.processArray(curveArray, "yCRV");

    totalLoanHistoricalBal = totalLoanHistoricalBal.concat(processedTusdArray);
    totalLoanHistoricalBal = totalLoanHistoricalBal.concat(processedCurveArray);

    loanTokenNameSet.add("TUSD");
    loanTokenNameSet.add("yCRV");

    const loanTokens = await tokenHelper.loanTokenBalance();


    await Promise.all(loanTokens.map(async (address, index) => {
        let singleLoanHistoricalBal = [];

        const loan1 = new ethers.Contract(contracts.loan1, tusdAbi, wallet);

        const loanOutFilter = {
            address: address,
            topics: loan1.filters.Transfer(contracts.lender).topics,
            fromBlock: 11280398,
            toBlock: "latest"
        };

        const loanInFilter = {
            address: address,
            topics: loan1.filters.Transfer(null, contracts.lender).topics,
            fromBlock: 11280398,
            toBlock: "latest"
        };

        let tokenData = await tokenHelper.loanTokenHelper(address);

        let loanOutLogs = await logsHelper.getLogs("filter", null, loanOutFilter);
        let loanOutEvents = await eventHelper.getEvents("filter", loanOutLogs, null, -1);

        let loanInLogs = await logsHelper.getLogs("filter", null, loanInFilter);
        let loanInEvents = await eventHelper.getEvents("filter", loanInLogs, null, 1);

        if (tokenData.length > 0 && loanOutEvents.length > 0 && loanInEvents.length > 0) {
            loanTokenNameSet.add(index);
            singleLoanHistoricalBal = arrayHelper.mergeArray([...tokenData, ...loanOutEvents, ...loanInEvents]);
        }

        if (singleLoanHistoricalBal !== undefined && singleLoanHistoricalBal.length > 0) {
            for (let i = 0; i < singleLoanHistoricalBal.length; i++) {
                const loanTokenName = `Loan${index}`;

                totalLoanHistoricalBal.push({
                    data: {
                        name: loanTokenName,
                        balance: singleLoanHistoricalBal[i].total.toFixed(0),
                    },
                    blockNumber: singleLoanHistoricalBal[i].blockNumber
                });
            }
        }
    }));

    let combined = arrayHelper.mergeCompositionChartData(totalLoanHistoricalBal, loanTokenNameSet);

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            data: combined,
            loanTokenNameSet: Array.from(loanTokenNameSet),
        }),
    };

};