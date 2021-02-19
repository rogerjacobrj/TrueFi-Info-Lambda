const ethers = require("ethers");
const connect = require("./providers");
const contracts = require("./constants");
const logsHelper = require("./logs");

const [, provider, wallet] = connect();

const tusdAbi = [
    "event Transfer(address indexed src, address indexed dst, uint val)",
    "event Funded(address indexed loanToken, uint256 amount)",
    "function totalSupply() public view returns (uint256)",
    "event LoanTokenCreated(address contractAddress)"
];

const lender = new ethers.Contract(contracts.lender, tusdAbi, wallet);


const tokenHelper = {
    loanTokenFinder: async () => {
        let results = [];
        let logs;

        let filter = {
            address: contracts.loanFactory,
            topics: lender.filters.LoanTokenCreated().topics,
            fromBlock: 11280398,
            toBlock: "latest"
        };

        try {
            logs = await logsHelper.getLogs("filter", null, filter);
        } catch (error) {
            return error;
        }

        if (logs.length > 0) {
            logs.forEach(item => {
                const address = '0x' + item['data'].substr(2 + 24, 40);
                results.push(address);
            });
        }

        return results;
    },
    loanTokenHelper: async (address) => {
        let results = [];
        const loanContract = new ethers.Contract(address, tusdAbi, wallet);
        const value = await loanContract.totalSupply() / 1e18;

        let filter = {
            address: contracts.lender,
            topics: lender.filters.Funded(address).topics,
            fromBlock: 11280398,
            toBlock: "latest"
        };

        try {
            logs = await logsHelper.getLogs("filter", null, filter);
        } catch (error) {
            return error;
        }

        if (logs) {
            results.push({
                total: 0,
                marginChange: value,
                blockNumber: 1
            });
        }

        return results;
    },
    loanTokenBalance: async () => {
        let loanTokens = await tokenHelper.loanTokenFinder();
        return loanTokens;
    },
    getTimestamp: (blockNumber) => {
        return 1605682163 + (blockNumber - 11280398) * 14;
    }
};

module.exports = tokenHelper;