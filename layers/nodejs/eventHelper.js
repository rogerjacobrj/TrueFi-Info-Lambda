const helper = {
    getEvents: async (type, logs, index = null, sign = null) => {
        let total = 0;
        let result = [];

        for (let i = 0; i < logs.length; i++) {

            if (type === "topic") {
                const value = parseInt(logs[i]['data'].substr(2 + 64 * index, 64), 16) / 1e18;
                const valueNum = Number(value.toFixed(0));

                total += valueNum;

                result.push({
                    total: total,
                    marginChange: valueNum,
                    blockNumber: logs[i]['blockNumber']
                });
            } else {
                const value = parseInt(logs[i]['data'].substr(2, 64), 16) / 1e18;
                result.push({
                    total: 0,
                    marginChange: value * sign,
                    blockNumber: logs[i]['blockNumber']
                })
            }
        }
        return result;
    }
};

module.exports = helper;