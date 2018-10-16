

const express = require('express') 
const profilectrl = require('./router/index.js')

const app = express();

app.use(express.static('assest'))

// app.get("/user/:email",profilectrl.index);
app.get('/block/:blockHeight', profilectrl.getChainBlock);
app.post('/block', profilectrl.addChainBlock);

app.listen(8000, () => {
	console.log('port created successfully') 
})
