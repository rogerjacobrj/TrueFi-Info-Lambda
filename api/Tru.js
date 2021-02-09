const ethers = require("ethers");
const connect = require("./utils/providers");
const contracts = require("./utils/constants");

const [, , wallet] = connect();

const abi = ['function totalSupply() public view returns (uint256)', 'function distributed() public view returns (uint256)'];
const TrustToken = new ethers.Contract(contracts.tru, abi, wallet);

exports.getTru = async (event) => {
    const supply = await TrustToken.totalSupply() / 1e8;
    const MAX_SUPPLY = 1450000000;
    const burned = MAX_SUPPLY - supply;
    let distributed = 0;

    const linearDistributors = [
        contracts.tfiLpDistributor,
        contracts.uniTusdTfiDistributor,
        contracts.uniEthTruDistributor,
        contracts.balBalTruDistributor,
    ];

    for (let i = 0; i < linearDistributors.length; i++) {
        const distributor = new ethers.Contract(linearDistributors[i], abi, wallet);
        distributed += await distributor.distributed() / 1e8;
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
            data: {
                'supply': supply,
                'burned': burned,
                'distributed': distributed
            }
        })
    };
}