var express = require("express");
var path = require("path");
var app = express();

app.use(express.static(path.join(__dirname + "/static")));
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.get('/', function(req,res){
	res.render("index");
});

var server = app.listen(8000, function(){
	console.log("Hello on Port 8000!");
});

var io = require("socket.io").listen(server);

var messages = [];

io.sockets.on("connection", function(socket){
	console.log("connection established on socket " + socket.id);
	var user;
	socket.on("got_a_new_user", function(data){
		user = data;
		user.id = socket.id;
		console.log(user);
		socket.emit("new_user", messages);
		var joined = "<p><span>" + user.name + " has joined the chat room</span></p>";
		messages.push(joined);
		socket.broadcast.emit("updated_chat", {
			message: joined
		})
	})
	socket.on("new_message", function(data){
		messages.push(data.message);
		io.emit("updated_chat", {
			message: data.message
		})
	})
	socket.on("disconnect", function(){
		var clock = new Date();
		console.log("socket " + socket.id + " was disconnected on " + clock);
		if(user){
			var left = "<p><span>" + user.name + " has left the room</span></p>";
			messages.push(left);
			socket.broadcast.emit("updated_chat", {
				message: left
			})
		}
	})
});