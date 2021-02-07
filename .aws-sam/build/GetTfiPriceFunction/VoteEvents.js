exports.getAllVotes = async (event) => {

    let votes = [];

    let { logs } = JSON.parse(event.body);

    for (let i = 0; i < logs.length; i++) {
        const blockNumber = logs[i]['blockNumber'];
        const staked = parseInt(logs[i]['data'].substr(194, 258), 16) / 1e8;
        const loanId = '0x' + logs[i]['data'].substr(26, 40);
        const voter = '0x' + logs[i]['data'].substr(90, 91).substr(0, 40);
        const vote = logs[i]['data'].substr(192, 193).substr(0, 2);

        votes.push({
            vote: (vote === '01') ? 'YES' : 'NO',
            staked: staked,
            voter: voter,
            loanId: loanId,
            blockNumber: blockNumber
        })
    }

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "text/plain",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            votes: votes
        })
    };
}