const tokenHelper = require("/opt/nodejs/tokenHelper");

const arrayHelper = {
    mergeArray: (array) => {
        array.sort((a, b) => (a.blockNumber > b.blockNumber) ? 1 : ((b.blockNumber > a.blockNumber) ? -1 : 0));

        for (let i = 1; i < array.length; i++) {
            array[i].total = array[i - 1].total + array[i].marginChange;
            if (array[i].blockNumber === array[i - 1].blockNumber) {
                array.splice(i - 1, 1);
                i--;
            }
        }

        return array;
    },
    processArray: (array, name) => {
        let newArray = []

        for (let i = 1; i < array.length; i++) {
            newArray.push({
                data: {
                    name: name,
                    balance: array[i].total.toFixed(0),
                    timestamp: tokenHelper.getTimestamp(array[i].blockNumber)
                },
                blockNumber: array[i].blockNumber
            })
        }

        return newArray;
    },
    mergeCompositionChartData: (array, loanTokenNameSet) => {
        let newArray = [];

        array.sort((a, b) => {
            return (a.blockNumber > b.blockNumber) ? 1 : ((b.blockNumber > a.blockNumber) ? -1 : 0);
        });

        const obj = {
            [array[0].data.name]: array[0].data.balance,
            blockNumber: array[0].blockNumber,
            timestamp: tokenHelper.getTimestamp(array[0].blockNumber)
        };

        loanTokenNameSet.forEach(name => {
            if (!isNaN(name)) {
                name = "Loan" + name;
            }

            if (name !== array[0].data.name) {
                obj[name] = 0;
            }
        });

        newArray.push(obj);


        for (let i = 1; i < array.length; i++) {
            const obj = {
                [array[i].data.name]: array[i].data.balance,
                blockNumber: array[i].blockNumber,
                timestamp: tokenHelper.getTimestamp(array[i].blockNumber)
            };

            loanTokenNameSet.forEach(name => {
                if (!isNaN(name)) {
                    name = "Loan" + name;
                }

                if (name !== array[i].data.name) {
                    obj[name] = newArray[i - 1][name];
                }
            });

            newArray.push(obj);
        }

        return newArray;
    }
};

module.exports = arrayHelper;