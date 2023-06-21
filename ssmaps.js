import ejs from "./ssejs.js";
import fs from "fs";
import npath from "path";
import error from "./sserr.js";
import mime from "mime";

export default function (req, res, obj, data = {}) {
    if (typeof data !== 'object' && typeof obj !== 'object') {
        console.log('data must be a object,path must be a object');
        return 'data must be a object,path must be a object';
    }
    var path = (obj.path[-1] === '/') ? obj.path.slice(0, -1) : obj.path;
    obj.prefix = (obj.prefix[-1] === '/') ? obj.prefix.slice(0, -1) : obj.prefix;
    obj.prefix = (obj.prefix[0] === '/') ? obj.prefix : '/' + obj.prefix;
    if (!fs.existsSync(path)) {
        error[500](req, res, `Couldn't find path:${path}`);
    } else {
        if (path[path.length - 1] === '/') {
            path = path.slice(0, -1);
        }
        var FilePath = path + '/' + req.url.pathname.slice(obj.prefix.length, req.url.pathname.length);
        //console.log(FilePath)
        if (fs.existsSync(FilePath)) {
            if (fs.statSync(FilePath).isFile()) {
                FileExt = npath.extname(FilePath).slice(1);
                if (FileExt === '') {
                    res.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
                    res.end(fs.readFileSync(FilePath));
                } else if (FileExt === 'ejs') {
                    ejs(req, res, 200, FilePath, data);
                } else {
                    res.writeHead(200, {'Content-Type': mime.getType(FileExt) + ';charset=utf-8'});
                    res.end(fs.readFileSync(FilePath));
                }
            } else {
                let FileLS = fs.readdirSync(FilePath);
                for (let i = 0; i < FileLS.length; i++) {
                    if (FileLS[i].indexOf('index') !== -1) {
                        FileExt = npath.extname(FilePath + '/' + FileLS[i]).slice(1);
                        if (FileExt === '') {
                            res.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
                            res.end(fs.readFileSync(FilePath + '/' + FileLS[i]));
                        } else if (FileExt === 'ejs') {
                            ejs(req, res, 200, FilePath + '/' + FileLS[i], data);
                        } else {
                            res.writeHead(200, {'Content-Type': mime.getType(FileExt) + ';charset=utf-8'});
                            res.end(fs.readFileSync(FilePath + '/' + FileLS[i]));
                        }
                    }
                }
            }
        } else {
            error[404](req, res);
        }
    }
}
