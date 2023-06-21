import ejs from "./ssejs.js";
import fs from "fs";
import npath from "path";
import error from "./sserr.js";
import mime from "mime";

export default function (req, res, path, data = {}) {
    if (typeof data !== 'object' && typeof path !== 'string') {
        console.log('data must be a object,path must be a string')
        return 'data must be a object,path must be a string'
    }
    if (!fs.existsSync(path)) {
        error[500](req, res, `Couldn't find path:${path}`)
    } else {
        if (path[path.length - 1] === '/') {
            var path = path.slice(0, -1)
        }
        if (path.split('/')[path.split('/').length - 1] !== '.ss_root') {
            var FilePath = path.split('/').slice(0, path.split('/').length - 1).join('/') + '/' + req.url.pathname.split('/').slice((req.url.pathname.split('/').indexOf(path.split('/')[path.split('/').length - 1]) !== -1) ? req.url.pathname.split('/').indexOf(path.split('/')[path.split('/').length - 1]) : req.url.pathname.length - 1, req.url.pathname.length - 1).join('/')
        } else {
            var FilePath = path + req.url.pathname
        }
        if (fs.existsSync(FilePath)) {
            if (fs.statSync(FilePath).isFile()) {
                var FileExt = npath.extname(FilePath).slice(1)
                if (FileExt === '') {
                    res.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'})
                    res.end(fs.readFileSync(FilePath))
                } else if (FileExt === 'ejs') {
                    ejs(req, res, 200, FilePath, data)
                } else {
                    res.writeHead(200, {'Content-Type': mime.getType(FileExt) + ';charset=utf-8'})
                    res.end(fs.readFileSync(FilePath))
                }
            } else {
                let FileLS = fs.readdirSync(FilePath)
                for (let i = 0; i < FileLS.length; i++) {
                    if (FileLS[i].indexOf('index') !== -1) {
                        var FileExt = npath.extname(FilePath + '/' + FileLS[i]).slice(1)
                        if (FileExt === '') {
                            res.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'})
                            res.end(fs.readFileSync(FilePath + '/' + FileLS[i]))
                        } else if (FileExt === 'ejs') {
                            ejs(req, res, 200, FilePath + '/' + FileLS[i], data)
                        } else {
                            res.writeHead(200, {'Content-Type': mime.getType(FileExt) + ';charset=utf-8'})
                            res.end(fs.readFileSync(FilePath + '/' + FileLS[i]))
                        }
                    }
                }
            }
        } else {
            error[404](req, res)
        }
    }
}
