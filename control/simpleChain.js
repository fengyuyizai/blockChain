/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const level = require('./levelSandbox.js')

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor(){
    this.chain = [];
    this.getBlockHeight().then((result) => {
      if(result == -1) {
        console.log("添加创世区块")
        this.addBlock(new Block("Genesis"));
      }
    })
  }

    // Add new block
  async addBlock(newBlock){
    // Block height
    const beforeBlockheight = await this.getBlockHeight();
    console.log('beforeBlockheight:' + beforeBlockheight);
    if (beforeBlockheight == -1) {
      newBlock.height = 0;
    } else {
      newBlock.height = beforeBlockheight + 1;
      const beforeBlock = await this.getBlock(beforeBlockheight) 
      this.chain[beforeBlockheight] = JSON.parse(beforeBlock)
    }

    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0,-3);
    // previous block hash
    if(this.chain.length>0){
      newBlock.previousBlockHash = this.chain[this.chain.length-1].hash;
    }
    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    // Adding block object to chain
    this.chain.push(newBlock);
    // save to levelDB
    // console.log('simpleCahin.addBlock:' + newBlock.height)
    const result = await level.addDataToLevelDB(newBlock.height, JSON.stringify(newBlock).toString())
    if (result) {
      return JSON.stringify(newBlock).toString()
    }
    return 'false'
  }

  // Get block height
    getBlockHeight(){

      return new Promise((resolve, reject) => {
        level.getLevelDBBlockHeight().then((result) => {
          // console.log('simpleCahin.getBlockHeight:' + result)
          resolve(parseInt(result) - 1)
    
        }).catch((err) => {
          reject('未查询到创世区块');
        })
      })
      // this.chain.length-1;
    }

    // get block
    getBlock(blockHeight){
      // return object as a single string
      return new Promise((resolve, reject) => {
        level.getLevelDBData(blockHeight).then((result) => {
          // console.log('simpleCahin.getBlock.Height:' + blockHeight)
          // console.log('simpleCahin.getBlock.result:' + result)
          resolve(result);
        }).catch((err) => {
          // 没有查找到相关区块
          reject(err);
        })
      })
      
        // return JSON.parse(JSON.stringify(this.chain[blockHeight]));
    }

    // validate block
    validateBlock(blockHeight){
      // get block object
      // 
      
      this.getBlock(blockHeight).then((result) => {
        let block = JSON.parse(result);

        // get block hash
        let blockHash = block.hash;
        // remove block hash to test block integrity
        block.hash = '';
        // generate block hash
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
        // Compare
        if (blockHash===validBlockHash) {
            return false;
          } else {
            console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
            return true;
          }
      });
    }

   // Validate blockchain
    async validateChain(){
      const chainHeight = await this.getBlockHeight();
      let errorLog = [];
      for (var i = 0; i < chainHeight; i++) {
        // console.log('chainHeight:' + i)
        // validate block
        
        if (this.validateBlock(i)){
          errorLog.push(i);
        }
        // // compare blocks hash link
        let block = await this.getBlock(i);
        let blockHash = JSON.parse(block).hash;
        let previous = await this.getBlock(i + 1);
        let previousHash = JSON.parse(previous).previousBlockHash;
        if (blockHash !== previousHash) {
          console.log('blockHash::' + blockHash)
          console.log('previousHash::' + previousHash)
          errorLog.push(i);
        }
      }
      if (errorLog.length>0) {
        console.log('Block errors = ' + errorLog.length);
        console.log('Blocks: '+errorLog);
      } else {
        console.log('No errors detected');
      }

    }
}


const myBlockChain = new Blockchain();
// (function theLoop (i) {
//     setTimeout(function () {
        
//         let blockTest = new Block("Test Block - " + (i));
//         myBlockChain.addBlock(blockTest).then((result) => {
//             i ++
//             console.log(result + ' index:' + i);
//             if (i < 4) theLoop(i);
//         });
//     }, 2000);
//   })(1);

myBlockChain.validateChain()

module.exports= {
  Block: Block,
  Blockchain: Blockchain
}

