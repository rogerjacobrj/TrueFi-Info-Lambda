const eventHelper = require("/opt/nodejs/eventHelper");
// const eventHelper = require("./eventHelper");
const logsHelper = require("/opt/nodejs/logs");
// const logsHelper = require("./logs");
const arrayHelper = require("/opt/nodejs/arrayHelper");
// const arrayHelper = require("./arrayHelper");

exports.index = async (event) => {
    let joinedLogs, poolJoined, exitedLogs, poolExited, merged;

    joinedLogs = await logsHelper.getLogs("topic", "Joined(address,uint256,uint256)");
    if (joinedLogs) {
        poolJoined = await eventHelper.getEvents("topic", joinedLogs, 0);
    }

    exitedLogs = await logsHelper.getLogs("topic", "Exited(address,uint256)");
    if (exitedLogs) {
        poolExited = await eventHelper.getEvents("topic", exitedLogs, 0);
    }

    if (poolExited) {
        poolExited.forEach(element => {
            element.marginChange *= -1; // turn into negative value
        });
    }

    merged = arrayHelper.mergeArray([...poolJoined, ...poolExited]);

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            data: merged
        }),
    };
};