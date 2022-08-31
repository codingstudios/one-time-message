const express = require('express');
const app = express();
const mongoose = require('mongoose');
const helmet = require('helmet');
const path = require('path');
const crypto = require('crypto');
const Cryptr = require('cryptr');
const btoa = require('btoa');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const slowDown = require("express-slow-down");

app.use(helmet());
app.use(express.json());
app.enable('trust proxy');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

mongoose.connect('',  { useUnifiedTopology: true, useNewUrlParser: true });
const database = mongoose.model("msg", new mongoose.Schema({ id: String, value: String, code: String }));

app.post('/create', slowDown({
    windowMs: 30 * 1000,
    delayAfter: 1,
    delayMs: 500,
  }), rateLimit({
    windowMs: 30 * 1000,
    max: 1,
    message: (req,res) => {
        res.send({ id: 'You are being rate limited, plese try again later' });
    }
  }), async (req,res) => {
    try { 
        var { value } = req.body;
        if(!value) return res.status(400).send('Value is required');
        const id = crypto.randomBytes(5).toString('hex');
        const code = crypto.randomBytes(10).toString('hex');
        const cryptr = new Cryptr(code);
        value = cryptr.encrypt(value);
        if(!id || !value) return;
        await database({ id, value, code }).save();
        res.send({ id });
    }catch(e) {
        console.log(e);
    }
})

app.post('/read/:id', async (req,res) => {
    try {
        const { code } = req.body;
        const id = req.params.id;
        if(!id || !code) return res.status(400).send('Id and code are required');
        const data = await database.findOne({ id, code });
        if(!data) return res.status(400).send('Invalid id or code');
        await data.delete();   
        const cryptr = new Cryptr(code); 
        var value = cryptr.decrypt(data.value);
        const random = Math.floor(Math.random() * 15) + 1;
        for(var i = 0; i < random; i++) {
            value = btoa(value);
        }
        res.send({ value, random });
    }catch(e) {
        console.log(e);
    }
})

app.get('/', (req,res) => {
    res.render('create');
})

app.get('/:id', async (req,res) => {
    try {
    const data = await database.findOne({ id: req.params.id });
    if(!data) return res.redirect('/');
    setTimeout(async () => {
        await data.delete();
    }, 2000)
    res.render('read', { id: req.params.id, code: data?.code });
    }catch(e) {
        console.log(e)
    }
})

app.use((req,res) => {
    res.redirect('/')
});

app.listen(3000, () => {
    console.log('listing on port 3000');
})
