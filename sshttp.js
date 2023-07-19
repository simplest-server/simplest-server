import http from "http";
import { URL } from "url";
import UAParser from "ua-parser-js";
import formidable from "formidable";
import error from "./sserr.js"

export default function (n){
    n = n || {};
    if (typeof n !== 'object') {
        throw new TypeError('path must be an object,not a ' + typeof n);
    }
    return http.createServer(function (req, res) {
        req.cookie = function (id, value, json = {path: '/', maxAge: null, expires: null, domain: null}) {
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
        req.clearCookie = function (id, path = '/') {
            this.setHeader('set-cookie', id + '=; maxAge=0; path=' + path);
        }
        //console.log(req.url);
        let url = new URL(req.url, "http://"+ (req.headers.host || "0.0.0.0"))
        req.url = {
            href: url.href,
            origin: url.origin,
            protocol: url.protocol,
            username: url.username,
            password: url.password,
            host: url.host,
            hostname: url.hostname,
            port: url.port,
            pathname: url.pathname,
            search: url.search,
            searchParams: url.searchParams,
            hash: url.hash,
            query: url.search.slice(1),
            path: url.pathname + url.search
        }
        req.getQueryVariable = function (variable, err) {
            if (req.url.query) {
                var vars = req.url.query.split("&");
                for (var i = 0; i < vars.length; i++) {
                    var pair = vars[i].split("=");
                    if (pair[0] === variable) {
                        return decodeURIComponent(pair[1]);
                    }
                }
            }
            return (err);
        }
        res.getQueryVariable = req.getQueryVariable
        req.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress || '';
        req.host = req.headers.host || '0.0.0.0'
        var uaParser = new UAParser(req.headers['user-agent']);
        req.UA=uaParser.getResult()
        req.cookie = {}
        req.path = n
        if (req.headers.cookie && req.headers.cookie.indexOf('=') !== -1) {
            if (req.headers.cookie.indexOf('; ') !== -1) {
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
        if (req.method === 'OPTIONS') {
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
        res.err={}
        if (n['404']&& typeof n['404'] == 'function'){
            res.err[404]=n['404']
        }
        if (n['500']&& typeof n['500'] == 'function'){
            res.err[500]=n['500']
        }
        const form = formidable({multiples: true});
        form.parse(req, function (err, fields, files) {
            req.body = {error: err, fields: fields, files: files};
            Object.keys(n).forEach(function (key) {
                if (typeof n[key] !== 'function'||a>0) {
                    return;
                }
                if (key.indexOf(':') < 0) {
                    if (req.url.pathname === key) {
                        a++
                        try {
                            n[key](req, res)
                        } catch (e) {
                            error[500](req, res, e)
                        }
                    }
                } else {
                    if (new RegExp('^' + key.split(':')[1] + '$', key.split(':')[0]).test(req.url.pathname)) {
                        a++
                        try {
                            n[key](req, res)
                        } catch (e) {
                            error[500](req, res, e)
                        }
                    }
                }
            })
            if (a === 0) {
                if ('404' in n && typeof n['404'] === 'function') {
                    n['404'](req, res);
                } else {
                    error[404](req, res)
                }
            }
        })
    })
}
