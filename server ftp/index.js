console.log("starting");
const fs = require("fs");
const yaml = require("yaml");
const config = yaml.parse(fs.readFileSync(__dirname + "/config.yml", "utf8"));

const { io } = require("socket.io-client");
const SocketUrl = config.socket.url;
const socket = io(SocketUrl);

const FtpSrv = require("ftpd");
const FtpPort= config.ftp.port;
const FtpPath= config.ftp.path;
const FtpLoginTimeout= config.ftp.loginTimeout;



const ftpServer = new FtpSrv.FtpServer("0.0.0.0", {
	getInitialCwd: function() {
		return "/";
	},
	getRoot: function() {
		return FtpPath;
	},
	pasvPortRangeStart: 1025,
	pasvPortRangeEnd: 1050,
	tlsOptions: false,
	allowUnauthorizedTls: true,
	useWriteFile: false,
	useReadFile: false,
	uploadMaxSlurpSize: 7000, // N/A unless 'useWriteFile' is true.
});


ftpServer.on("error", function(error) {
	console.log("FTP Server error:", error);
});
ftpServer.on("client:connected", function(connection) {

	let username = null;
	console.log("client connected: " + connection.remoteAddress);
	connection.on("command:user", function(user, success, failure) {
		if (user) {
			username = user;
			success();
		} else {
			failure();
		}
	});
  
	connection.on("command:pass", function(pass, success, failure) {
		if (pass) {
			let timedout = setTimeout(()=> {
				timedout = undefined;
				return failure("Login Timed Out");
			}, FtpLoginTimeout);

			socket.emit("login", username, pass, callback => {
				clearTimeout(timedout);
				if (timedout === undefined) return;
				if (callback.result === true){
					return success(username);    
				}
				return failure("Invalid username or password");
			});
			
		} else {
			failure();
		}
	});
});



ftpServer.debugging = 4;
ftpServer.listen(FtpPort);
console.log("Listening on port " + FtpPort);

/*new FtpSrv({
	url: "ftp://0.0.0.0:" + FtpPort,
	anonymous: true
});*/

/*
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
*/