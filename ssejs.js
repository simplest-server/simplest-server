import ejs from "ejs";
import fs from "fs";
import error from "./sserr.js";

export default function (req, res, code, path, data = {}) {
    if (typeof data !== 'object' && typeof path !== 'string') {
        console.log('data must be a object,path must be a string');
        return 'data must be a object,path must be a string';
    }
    if (!fs.existsSync(path)) {
        error[500](req, res, `Couldn't find path:${path}`);
    } else {
        if (fs.existsSync(path + 'layout.ejs')) {
            ejs.renderFile(path, data, function (err, body) {
                if (err) {
                    error[500](req, res, err);
                } else {
                    data[body] = body;
                    ejs.renderFile(path, data, function (err, data) {
                        if (err) {
                            error[500](req, res, err);
                        } else {
                            res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
                            res.end(data);
                        }
                    });
                }
            });
        } else {
            ejs.renderFile(path, data, function (err, data) {
                if (err) {
                    error[500](req, res, err);
                } else {
                    res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
                    res.end(data);
                }
            });
        }
    }
}
