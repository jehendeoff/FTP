console.log("starting");
const fs = require("fs");
const yaml = require("yaml");
const config = yaml.parse(fs.readFileSync(__dirname + "/config.yml", "utf8"));

const { io } = require("socket.io-client");
const SocketUrl = config.socket.url;
const socket = io(SocketUrl);

const FtpSrv = require("ftp-srv");
const FtpPort= config.ftp.port;
const FtpPath= config.ftp.path;
const FtpLoginTimeout= config.ftp.loginTimeout;



const ftpServer = new FtpSrv({
	url: "ftp://0.0.0.0:" + FtpPort,
	anonymous: true
});

ftpServer.on("login", ({connection, username, password}, resolve, reject)=> {
	let timedout = setTimeout(()=> {
		timedout = undefined;
		return reject("Login Timed Out");
	}, FtpLoginTimeout);

	socket.emit("login", username, password, callback => {
		clearTimeout(timedout);
		if (timedout === undefined) return;
		if (callback.result === true){
			return resolve({ root: FtpPath });    
		}
		return reject("Invalid username or password");
	});

});

ftpServer.listen().then(() => { 
	console.log("Ftp server is starting...");
});