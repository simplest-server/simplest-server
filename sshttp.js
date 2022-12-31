const http = require("http");
const url = require("url");
const UAParser = require("ua-parser-js");
const formidable = require("formidable");
module.exports = function (n){
    n = n || {};
    if (typeof n !== 'object') {
        throw new TypeError('path must be an object,not a ' + typeof n);
    }
    return http.createServer(function (req, res) {
        res.cookie = function (id, value, json = {path: '/', maxAge: null, expires: null, domain: null}) {
            if (json.maxAge) {
                json.maxAge = '; max-age=' + json.maxAge;
            } else {
                json.maxAge = '';
            }
            if (json.expires) {
                json.expires = '; expires=' + json.expires;
            } else {
                json.expires = '';
            }
            if (json.domain) {
                json.domain = '; domain=' + json.domain;
            } else {
                json.domain = '';
            }
            if (!json.path) {
                json.path = '/';
            }
            this.setHeader('set-cookie', id + '=' + value + '; path=' + json.path + json.maxAge + json.expires + json.domain);
        }
        res.clearCookie = function (id, path = '/') {
            this.setHeader('set-cookie', id + '=; maxAge=0; path=' + path);
        }
        req.url = url.parse(req.url)
        res.getQueryVariable = function (variable, err) {
            if (req.url.query) {
                var vars = req.url.query.split("&");
                for (var i = 0; i < vars.length; i++) {
                    var pair = vars[i].split("=");
                    if (pair[0] == variable) {
                        return decodeURIComponent(pair[1]);
                    }
                }
            }
            return (err);
        }
        req.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress || '';
        req.host = req.headers.host || '0.0.0.0'
        var uaParser = new UAParser(req.headers['user-agent']);
        req.UA=uaParser.getResult()
        req.cookie = {}
        res.path = n
        if (req.headers.cookie && req.headers.cookie.indexOf('=') != -1) {
            if (req.headers.cookie.indexOf('; ') != -1) {
                var x = req.headers.cookie.split("; ");
            } else {
                var x = [req.headers.cookie];
            }
            for (let i = 0; i < x.length; i++) {
                req.cookie[x[i].split('=')[0]] = x[i].split('=')[1];
            }
        }
        let a = 0
        if (!req.headers['Content-Type']) {
            req.headers['Content-Type'] = 'application/json'
        }
        if (req.method == 'OPTIONS') {
            if (n['OPTIONS'] && typeof n['OPTIONS'] == 'function') {
                n['OPTIONS'](req, res)
                return false;
            } else {
                res.setHeader("Access-Control-Allow-Methods", "*");
                res.setHeader("Access-Control-Allow-Headers", "Content-Type");
                res.setHeader('Access-Control-Allow-Credentials', true);
                res.setHeader('Access-Control-Allow-Origin', '*')
                res.writeHead(200, {'Content-Type': 'text/plan;charset=utf-8'});
                res.end('')
                return false;
            }
        }
        if (n['AllRun']&& typeof n['AllRun'] == 'function'){
            n['AllRun'](req, res)
        }

        const form = formidable({multiples: true});
        form.parse(req, function (err, fields, files) {
            req.body = {error: err, fields: fields, files: files};
            Object.keys(n).forEach(function (key) {
                if (typeof n[key] !== 'function') {
                    return;
                }
                if (key.indexOf(':') < 0) {
                    if (req.url.pathname === key) {
                        a++
                        try {
                            n[key](req, res)
                        } catch (e) {
                            res.writeHead(500, {'Content-Type': 'text/html;charset=utf-8'});
                            res.end(`<title>500 Server Error</title><style>h1,p {text-align:center;}</style><h1>500 Server Error</h1><hr><p>Simplest Server</p>
                            <br><strong>sorry,server is broken.</strong><br><div>
                            time: ${Date()}
                            <br>
                            ip: ${req.ip}
                            <br>
                            path: ${req.url.pathname}
                            <br>
                            msg: ${e}
                            </div>`);
                            console.log(`__________________________\ntimes: ${Date()}\nip: ${req.ip}\npath: ${req.url.pathname}\nmsg: ${e}\n__________________________`);
                        }
                    }
                } else {
                    if (new RegExp('^' + key.split(':')[1] + '$', key.split(':')[0]).test(req.url.pathname)) {
                        a++
                        try {
                            n[key](req, res)
                        } catch (e) {
                            res.writeHead(500, {'Content-Type': 'text/html;charset=utf-8'});
                            res.end(`<title>500 Server Error</title><style>h1,p {text-align:center;}</style><h1>500 Server Error</h1><hr><p>Simplest Server</p>
                            <br><strong>sorry,server is broken.</strong><br><div>
                            time: ${Date()}
                            <br>
                            ip: ${req.ip}
                            <br>
                            path: ${req.url.pathname}
                            <br>
                            msg: ${e}
                            </div>`);
                            console.log(`__________________________\ntimes: ${Date()}\nip: ${req.ip}\npath: ${req.url.pathname}\nmsg: ${e}\n__________________________`);
                        }
                    }
                }
            })
            if (a === 0) {
                if ('404' in n && typeof n['404'] === 'function') {
                    n['404'](req, res);
                } else {
                    res.writeHead(404, {'Content-Type': 'text/html;charset=utf-8'});
                    res.end('<title>404 Not Found</title><style>h1,p {text-align:center;}</style><h1>404 Not Found</h1><hr><p>Simplest Server</p>');
                }
            }
        })
    })
}
