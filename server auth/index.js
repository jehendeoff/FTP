console.log("starting");
const fs = require("fs");
const yaml = require("yaml");
const config = yaml.parse(fs.readFileSync(__dirname + "/config.yml", "utf-8"));

const { Server } = require("socket.io");
const IOPort = config.socket.port;
const io = new Server();
io.listen(IOPort);

io.on("connection", socket => {
	socket.on("login", (username, password, callback) => {
		test_user(username, password).then(()=> {
			callback({result: true});
		}).catch(()=> {
			callback({result: false});
		});

	});
});

const {execFile} = require("child_process");

function test_user(username, password){
	return new Promise((resolve, reject) => {
		const child = execFile(
			__dirname + "/user_login.sh",
			[username,password],
			{stdio: ["pipe", "pipe", "pipe"]});
	
		child.on("exit", function(code, signal) {
			if (code === 0) {
				return resolve();
			} 
			return reject();
		});
		
	});
}