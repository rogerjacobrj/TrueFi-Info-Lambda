const ethers = require("ethers");
const connect = require("./providers");
const contracts = require("./constants");
const logsHelper = require("/opt/nodejs/logs");
// const logsHelper = require("./logs");

const [, provider, wallet] = connect();

const tusdAbi = ["event Transfer(address indexed src, address indexed dst, uint val)", 'event Funded(address indexed loanToken, uint256 amount)', 'function totalSupply() public view returns (uint256)', 'event LoanTokenCreated(address contractAddress)']
const curveGaugeAbi = ['event Deposit(address indexed provider, uint256 value)', 'event Withdraw(address indexed provider, uint256 value)']

const tusd = new ethers.Contract(contracts.tusd, tusdAbi, wallet);
const curveGauge = new ethers.Contract(contracts.curveGauge, curveGaugeAbi, wallet);

// Filter options
const tusdOutFilter = {
    address: contracts.tusd,
    topics: tusd.filters.Transfer(contracts.tfi).topics,
    fromBlock: 11280398,
    toBlock: "latest"
};

const tusdInFilter = {
    address: contracts.tusd,
    topics: tusd.filters.Transfer(null, contracts.tfi).topics,
    fromBlock: 11280398,
    toBlock: "latest"
};

const curveOutFilter = {
    address: contracts.curveGauge,
    topics: curveGauge.filters.Withdraw(contracts.tfi).topics,
    fromBlock: 11280398,
    toBlock: "latest"
};

const curveInFilter = {
    address: contracts.curveGauge,
    topics: curveGauge.filters.Deposit(contracts.tfi).topics,
    fromBlock: 11280398,
    toBlock: "latest"
};

// Get logs by each applied filters
const compositionLogs = {
    tusdOutLogs: async () => {
        return await logsHelper.getLogs("filter", null, tusdOutFilter);
    },
    tusdInLogs: async () => {
        return await logsHelper.getLogs("filter", null, tusdInFilter);
    },
    curveOutLogs: async () => {
        return await logsHelper.getLogs("filter", null, curveOutFilter);
    },
    curveInLogs: async () => {
        return await logsHelper.getLogs("filter", null, curveInFilter);
    },
};

module.exports = compositionLogs;