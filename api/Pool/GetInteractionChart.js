// const helper = require("/opt/nodejs/eventHelper");
const helper = require("./eventHelper");
// const logsHelper = require("/opt/nodejs/logs");
const logsHelper = require("./logs");
// const mergeHelper = require("/opt/nodejs/mergeArray");
const mergeHelper = require("./mergeArray");

exports.index = async (event) => {
    let flushedLogs, flushedJoined, pulledLogs, pulledJoined, merged;

    flushedLogs = await logsHelper.getLogs("topic", "Flushed(uint256)");
    if (flushedLogs) {
        flushedJoined = await helper.getEvents(flushedLogs, 0);
    }

    pulledLogs = await logsHelper.getLogs("topic", "Pulled(uint256)");
    if (pulledLogs) {
        pulledJoined = await helper.getEvents(pulledLogs, 0);
    }

    if (pulledJoined) {
        pulledJoined.forEach(element => {
            element.marginChange *= -1; // turn into negative value
        });
    }

    merged = mergeHelper.merge([...flushedJoined, ...pulledJoined]);

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