const ejs = require('ejs')
module.exports = {
    500: function (req, res, err = '', name = "Simplest-Server") {
        if (res.err[500]) {
            try {
                res.err[500](req, res, err)
                return ''
            } catch (e) {
                console.log(e)
            }
        }
        console.log(ejs.render, `__________________________\ntimes: ${Date()}\nip: ${req.ip}\npath: ${req.url.pathname}\nmsg: ${err}\n__________________________`);
        res.writeHead(500, {'Content-Type': 'text/html;charset=utf-8'})
        res.end(`<title>500 Server Error</title><style>h1, p {text-align: center;}</style><h1>500 Server Error</h1><hr><p>${name}</p><br><strong>sorry,server is broken.</strong><br><div>time: ${Date()}<br>ip: ${req.ip}<br>path: ${req.url.pathname}<br>msg: ${err}</div>`)
    }, 404: function (req, res, name = "Simplest-Server") {
        if (res.err[404]) {
            try {
                res.err[404](req, res)
                return ''
            } catch (e) {
                console.log(e)
            }
        }
        console.log(`__________________________\ntimes: ${Date()}\nip: ${req.ip}\npath: ${req.url.pathname}\nmsg: 404\n__________________________`);
        res.writeHead(404, {'Content-Type': 'text/html;charset=utf-8'})
        res.end(`<title>404 Not Found</title><style>h1, p {text-align: center;}</style><h1>404 Not Found</h1><hr><p>${name}</p>`)
    }

}
