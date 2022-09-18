#!/usr/bin/env node
const mc = require("minecraft-protocol");
const colorMap = [
	0,  4,  2,  6,  1,  5,  3,  7,
	8, 12, 10, 14,  9, 13, 11, 15,
];
const styleMap = {
	k: 7, l: 1, m: 9, n: 4, o: 3, r: 0,
}
const color = e => {
	return e.replace(/\u00a7x(\u00a7[0-9a-f]){6}/g, (e) => {
		let a = "\u00a7([0-9a-f])";
		let s = e.match(RegExp("^\u00a7x" + a.repeat(6) + "$")).splice(1, 6).map(e => parseInt(e, 16));
		let r = s[0] << 4 | s[1];
		let g = s[2] << 4 | s[3];
		let b = s[4] << 4 | s[5];
		return `\x1b[0;38;2;${r};${g};${b}m`;
		return "a";
	}).replace(/\u00a7([0-9a-fklmnor])/g, (_, f) => {
		let s = "";
		if (f.match(/^[0-9a-f]$/)) {
			s += "0;38;5;" + colorMap[parseInt(f, 16)];
		} else {
			s += styleMap[f];
		}
		return `\x1b[${s}m`;
	});
}
const main = (argv) => {
	if (argv.length == 3 || argv.length == 4) {
		let host = argv[2];
		let port_ = argv[3];
		let port;
		if (host.length < 1) return;
		if (port_ == null) {
			port = 25565;
		} else {
			if (port_.length < 1) return;
			if (port_.length > 5) return;
			for (let i = 0; i < port_.length; ++i) {
				if (!("0123456789".includes(port_.charAt(i)))) return;
			}
			port = parseInt(port_);
		}
		if (port < 1 || port > 65535) return;
		console.error(`Pinging ${host} ${port}...`);
		mc.ping({ host, port }, (err, result) => {
			if (err) throw err;
			console.log(`Ping: ${result.latency}`);
			console.log(`Version: ${color(result.version.name)} (protocol ${result.version.protocol})`);
			console.log(`Players: ${result.players.online}/${result.players.max}`);
			console.log(`MOTD:`);
			console.log(`${color(result.description)}`);
		});
		return true;
	}
}
if (!main(process.argv))
	console.error("Usage: mcping.js <host> [<port>]");
