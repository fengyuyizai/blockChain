const simpleChain = require("../control/simpleChain.js");
var formidable = require("formidable");

const blockchain = new simpleChain.Blockchain();
// console.log(JSON.stringify(Blockchain));

exports.getChainBlock = function(req, res){
	const blockHeight = req.params.blockHeight;

	blockchain.getBlock(blockHeight).then((result) => {
		console.log(blockHeight);
		res.send(result);
	}).catch((err) => {
		res.send(err)
	});
}

exports.addChainBlock = function(req, res){
	// console.log('req:' + JSON.stringify(req))
	// 使用formidable获取请求体
	var form = new formidable.IncomingForm();
	form.parse(req, function(err , fields , files) {
		console.log("fields:" + fields.block);
		const block = new simpleChain.Block();
		block.body = fields.block;
		blockchain.addBlock(block).then((result) => {
			if(result != 'false') {
				res.send(result);
			} else {
				res.send('add Block is fault');
			}
		}).catch((err) => {
			res.send(err)
		})

	})
}