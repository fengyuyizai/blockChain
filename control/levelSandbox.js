/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

// Add data to levelDB with key/value pair
function addLevelDBData(key,value,height){
  // console.log('level.addLevelDBData:' + key)
  db.put(key, value, function(err) {
    if (err) return console.log('Block ' + key + ' submission failed', err);
  })
  db.put('height', height, function(err) {
    if (err) return console.log('BlockHeight ' + height + ' submission failed', err);
  })
}

// Get data from levelDB with key
function getLevelDBData(key){
  return new Promise((resolve, reject) => {
            db.get(key, function(err, value) {
                if (err) {
                  console.log('未查询到区块')
                  reject(err)
                };
                // console.log('levelSandbox:' + value)
                resolve(value);
            });
        })
}

function getLevelDBBlockHeight(){
  return new Promise((resolve, reject) => {
            db.get('height', function(err, value) {
                if (err) resolve(0);
                // console.log('level.SandboxHeight:' + value)
                resolve(value);
            });
        })
}

// Add data to levelDB with value
function addDataToLevelDB(index, value) {
  // console.log('addDataToLevelDB:' + index)
  return new Promise((resolve, reject) => {
    db.createReadStream()
        .on('data', function (data) {
            index = index;
        })
        .on('error', function (err) {
            console.log('Unable to read data stream!', err)
            reject(err)
        })
        .on('close', function () {
            console.log('Block #' + index);
            addLevelDBData(index, value, index + 1);
            resolve('true');
        });
  })
    
  // db.createReadStream().on('data', function(data) {
  //       i++;
  //     }).on('error', function(err) {
  //         return console.log('Unable to read data stream!', err)
  //     }).on('close', function() {
  //       console.log('Block #' + i);
  //       addLevelDBData(i, value);
  //     });
}

/* ===== Testing ==============================================================|
|  - Self-invoking function to add blocks to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blocks per hour                            |
|     (13.89 hours for 500,000 blocks)                                         |
|    Bitcoin blockchain adds 8640 blocks per day                               |
|     ( new block every 10 minutes )                                           |
|  ===========================================================================*/


// (function theLoop (i) {
//   setTimeout(function () {
//     addDataToLevelDB('Testing data');
//     if (--i) theLoop(i);
//   }, 100);
// })(10);
// 
module.exports = {
  addLevelDBData : addLevelDBData,
  getLevelDBData : getLevelDBData,
  addDataToLevelDB : addDataToLevelDB,
  getLevelDBBlockHeight: getLevelDBBlockHeight
}
// 只能存储10个区块，超过10个不再存储，并输出该10个区块