const ejs = require('./ssejs');
const fs = require('fs');
const npath = require('path');
const error = require('./sserr');
const mime = require('mime');
module.exports = function (req, res, path, data = {}) {
    if (typeof data !== 'object' && typeof path !== 'string') {
        console.log('data must be a object,path must be a string')
        return 'data must be a object,path must be a string'
    }
    fs.exists(path, function (exists) {
        if (!exists) {
            error[500](req, res, `Couldn't find path:${path}`)
        } else {
            if (path[path.length - 1] === '/') {
                path = path.slice(0, -1)
            }
            if (path.split('/')[path.split('/').length - 1] !== '.ss_root') {
                var FilePath = path.split('/').slice(0, path.split('/').length - 1).join('/') + '/' + req.url.pathname.split('/').slice((req.url.pathname.split('/').indexOf(path.split('/')[path.split('/').length - 1]) !== -1) ? req.url.pathname.split('/').indexOf(path.split('/')[path.split('/').length - 1]) : req.url.pathname.length - 1, req.url.pathname.length - 1).join('/')
            } else {
                var FilePath = path + req.url.pathname
            }
            console.log(FilePath)
            fs.exists(FilePath, function (exists) {
                if (exists) {
                    console.log(FilePath, fs.statSync(FilePath).isDirectory())
                    if (fs.statSync(FilePath).isFile()) {
                        FileExt = npath.extname(FilePath).slice(1)
                        if (FileExt === '') {
                            res.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'})
                            res.end(fs.readFileSync(FilePath))
                        } else if (FileExt === 'ejs') {
                            ejs(req, res, 200, FilePath, data)
                        } else {
                            res.writeHead(200, {'Content-Type': mime.getType(FileExt)+';charset=utf-8'})
                            res.end(fs.readFileSync(FilePath))
                        }
                    } else {
                        console.log(fs.readdirSync(FilePath))
                    }
                } else {
                    error[404](req, res)
                }
            })
        }
    });
}
