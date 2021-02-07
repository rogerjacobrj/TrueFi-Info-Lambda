const ethers = require("ethers");
const connect = require("./utils/providers");
const [, provider, wallet] = connect();

const abi = ['function borrower() public view returns (address)',
    'function getParameters() external view returns (uint256,uint256,uint256)',
    'function profit() public view returns (address)',
    'function status() public view returns (uint8)'
];

exports.getLoans = async (event) => {

    let loans = [];
    let para = [];
    const statusType = ['Listed', '', 'Withdrawn', 'Settled'];

    let { logs } = JSON.parse(event.body);

    for (let i = 0; i < logs.length; i++) {

        const loanTokenAddr = '0x' + logs[i]['data'].substr(26, 44);
        const loanToken = new ethers.Contract(loanTokenAddr, abi, wallet);

        try {
            para = await loanToken.getParameters();
        } catch (error) {
            console.log(err);
            return err;
        }

        loans.push({
            'borrower': await loanToken.borrower(),
            'amount': para[0] / 1e18,
            'apy': para[1] / 1e2,
            'term': para[2] / (60 * 60 * 24),
            'profit': await loanToken.profit() / 1e18,
            'blockNumber': logs[i]['blockNumber'],
            status: statusType[await loanToken.status()]
        });
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
            loans: loans
        })
    };

}