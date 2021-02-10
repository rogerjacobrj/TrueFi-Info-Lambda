const helper = require("/opt/nodejs/eventHelper");
// const helper = require("./eventHelper");
const logsHelper = require("/opt/nodejs/logs");
// const logsHelper = require("./logs");
const mergeHelper = require("/opt/nodejs/mergeArray");
// const mergeHelper = require("./mergeArray");

exports.index = async (event) => {
    let joinedLogs, poolJoined, exitedLogs, poolExited, merged;

    joinedLogs = await logsHelper.getLogs("topic", "Joined(address,uint256,uint256)");
    if (joinedLogs) {
        poolJoined = await helper.getEvents(joinedLogs, 0);
    }

    exitedLogs = await logsHelper.getLogs("topic", "Exited(address,uint256)");
    if (exitedLogs) {
        poolExited = await helper.getEvents(exitedLogs, 0);
    }

    if (poolExited) {
        poolExited.forEach(element => {
            element.marginChange *= -1; // turn into negative value
        });
    }

    merged = mergeHelper.merge([...poolJoined, ...poolExited]);

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