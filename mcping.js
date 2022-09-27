#!/usr/bin/env node
const mc = require("minecraft-protocol");
const colorMap = [
	0,  4,  2,  6,  1,  5,  3,  7,
	8, 12, 10, 14,  9, 13, 11, 15,
];
const styleMap = {
	k: 7, l: 1, m: 9, n: 4, o: 3, r: 0,
};
const colorNames = {
	black: 0, dark_blue: 1, dark_green: 2, dark_aqua: 3, dark_red: 4, dark_purple: 5, dark_yellow: 6, gold: 6, gray: 7, light_gray: 7,
	dark_gray: 8, blue: 9, green: 10, aqua: 11, red: 12, light_purple: 13, magenta: 13, yellow: 14, white: 15
};
const styleNames = {
	obfuscated: "k", bold: "l", strikethrough: "m", underline: "n", italic: "o"
}
const color = (e, o) => {
	if (!o) o = {};
	let s = e.replace(/\u00a7x(\u00a7[0-9a-f]){6}/g, (e) => {
		let a = "\u00a7([0-9a-f])";
		let s = e.match(RegExp("^\u00a7x" + a.repeat(6) + "$")).splice(1, 6).map(e => parseInt(e, 16));
		let r = s[0] << 4 | s[1];
		let g = s[2] << 4 | s[3];
		let b = s[4] << 4 | s[5];
		o.col = `\x1b[0;38;2;${r};${g};${b}m`;
		return o.col;
	}).replace(/\u00a7([0-9a-fklmnor])/g, (_, f) => {
		let s;
		if (f.match(/^[0-9a-f]$/)) {
			s = "0;38;5;" + colorMap[parseInt(f, 16)];
			s.k = s.l = s.m = s.n = s.o = false;
		} else {
			s = styleMap[f];
			if (f == 'r') {
				s.k = s.l = s.m = s.n = s.o = false;
			} else {
				o[f] = true;
			}
		}
		return `\x1b[${s}m`;
	});
	return { s, o };
}
const colorO = (e) => {
	let o = {};
	let s_ = "";
	for (let i in e) {
		let s;
		s = colorNames[e[i].color];
		s_ += "\x1b[0";
		if (s && colorMap[s]) s_ += ";38;5;" + colorMap[s];
		for (let j in styleNames) {
			if (e[i][j] != null) o[styleNames[j]] = e[i][j];
			if (o[styleNames[j]]) s_ += ";" + styleMap[styleNames[j]];
		}
		s_ += "m";
		if (e[i].text) { s = color(e[i].text, o); s_ += s.s; o = s.o; }
		if (e[i].extra) s_ += colorO(e[i].extra);
	}
	return s_;
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
			console.log(`Version: ${color(result.version.name).s}\x1b[0m (protocol ${result.version.protocol})`);
			console.log(`Players: ${result.players.online}/${result.players.max}`);
			console.log(`MOTD:`);
			const motd = result.description;
			if (typeof motd == "object") {
				if (motd.text) console.log(`${color(motd.text).s}`);
				if (motd.extra) console.log(`${colorO(motd.extra)}`);
			} else {
				console.log(`${color(motd).s}`);
			}
			console.log("\x1b[0m");
		});
		return true;
	}
}
if (!main(process.argv))
	console.error("Usage: mcping.js <host> [<port>]");
