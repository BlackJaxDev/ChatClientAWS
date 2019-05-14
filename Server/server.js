'use strict';

require("dotenv").config();

var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var url = require('url');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 3001;
app.set('port', port);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var MessageModel = mongoose.model('Message', {
    name : String,
    message : String
});
var UserModel = mongoose.model('User', {
    name : String,
    id : Number,
    notifCount : Number,
});
var ServerChannelModel = mongoose.model('Server', {
    serverName : String,
    channelName : String,
});
//example.com/server/settings/cool
app.get('/api/server/settings/:name', function(req, res)
{
    const params = req.params; //params = {name:"cool"}
    var serverName = params.name;
    ServerChannelModel.find({ serverName: serverName, channelName: channelName });
})
//example.com/server/cool/best_channel
app.get('/api/server/:serverName/:channelName', function(req, res)
{
    const params = req.params; //params = {serverName:"cool", channelName:"best_channel"}
    var serverName = params.serverName;
    var channelName = params.channelName;
    ServerChannelModel.find({ serverName: serverName, channelName: channelName });
})
//example.com/user/bob?id=2265
app.get('/api/user/:name', function(req, res)
{
    const query = req.query; //query = {id:"2265"}
    const params = req.params; //params = {name:"bob"}
    var userName = params.name;
    var userID = query.id;
    UserModel.find({ name: userName, id: userID });
})
app.get('/api/messages/:user/:otherUser', (req, res) =>
{
    //Return only the messages from this user to the other, not the other's messages to this user
    MessageModel.find({ }, (err, messages) => 
    {
        res.send(messages);
    })
})
app.post('/api/messages/:user/:otherUser', async (req, res) => 
{
    try
    {
        var message = new MessageModel(req.body);
        await message.save(); //Saves to database

        io.emit('message', req.body);
        res.sendStatus(200);
    }
    catch (error)
    {
        res.sendStatus(500);
        return console.log('error', error);
    }
    finally
    {
        console.log('Message posted');
    }
})

io.on('connection', function(socket)
{
    console.log('Client ' + socket.id + ' connected.');
    socket.on('disconnect', function()
    {
        console.log('Client ' + socket.id + ' disconnected.');
    });
});

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true });

const db = mongoose.connection;  
db.on('error', () =>
{
    console.error('Failed to connect to MongoDB.');
});  
db.once('open', () =>
{
    console.log("Connected to MongoDB successfully.");
    var server = http.listen(port, () => 
    {
        console.log('Server is running on port', server.address().port);
    });
});