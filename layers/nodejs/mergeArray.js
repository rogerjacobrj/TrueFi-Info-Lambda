const mergeArray = {
    merge: (array) => {
        array.sort((a, b) => (a.blockNumber > b.blockNumber) ? 1 : ((b.blockNumber > a.blockNumber) ? -1 : 0));
        for (let i = 1; i < array.length; i++) {
            array[i].total = array[i - 1].total + array[i].marginChange;
            if (array[i].blockNumber === array[i - 1].blockNumber) {
                array.splice(i - 1, 1);
                i--;
            }
        }

        return array;
    }
};

module.exports = mergeArray;