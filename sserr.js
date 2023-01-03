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
        console.log(ejs.render, `
__________________________
times: ${Date()}
ip: ${req.ip}
path: ${req.url.pathname}
msg: ${err}
__________________________
        `);
        res.writeHead(500, {'Content-Type': 'text/html;charset=utf-8'})
        res.end(ejs.render(`<title>500 Server Error</title>
<style>h1, p {
        text-align: center;
    }</style>
<h1>500 Server Error</h1>
<hr>
<p><%- name %></p>
<br>
<strong>sorry,server is broken.</strong>
<br>
<div>
    time: <%- time %>
    <br>
    ip: <%- ip %>
    <br>
    path: <%- url %>
    <br>
    msg: <%- err %>
</div>
`, {
            time: Date(), ip: req.ip, url: req.url.pathname, err: err, name: name
        }))
    }, 404: function (req, res, name = "Simplest-Server") {
        if (res.err[404]) {
            try {
                res.err[404](req, res)
                return ''
            } catch (e) {
                console.log(e)
            }
        }
        console.log(`
__________________________
times: ${Date()}
ip: ${req.ip}
path: ${req.url.pathname}
msg: 404
__________________________
        `);
        res.writeHead(404, {'Content-Type': 'text/html;charset=utf-8'})
        res.end(ejs.render(`<title>404 Not Found</title>
<style>h1, p {
        text-align: center;
    }</style>
<h1>404 Not Found</h1>
<hr>
<p><%- name %></p>
`, {
            name: name
        }))
    }

}
