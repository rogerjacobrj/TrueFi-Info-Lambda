const ethers = require("ethers");
const connect = require("./providers");
const contracts = require("./constants");

const [, provider, wallet] = connect();

const logsHelper = {
    getLogs: async (type, topic = null, filter = null) => {
        let logs, logsParam;

        if (type === "topic") {
            logsParam = {
                address: contracts.tfi,
                topics: [ethers.utils.id(topic)],
                fromBlock: 0,
                toBlock: "latest"
            }
        } else if (type === "filter") {
            logsParam = filter;
        }


        try {
            logs = await provider.getLogs(logsParam);
        } catch (error) {
            console.log(error);
            return error;
        }

        if (logs) {
            return logs;
        } else {
            return false;
        }
    }
};

module.exports = logsHelper;