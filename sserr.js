module.exports = {
    500: function (req, res, err = '', name = "simplest-server") {
        console.log(`
__________________________
times: ${Date()}
ip: ${req.ip}
path: ${req.url.pathname}
msg: ${err}
__________________________
        `);
        require('./ssejs')(req, res, 500, './err_page/500.ejs', {
            time: Date(),
            ip: req.ip,
            url: req.url.pathname,
            err: err,
            name: name
        });
    },
    404: function (req, res, name = "simplest-server") {
        console.log(`
__________________________
times: ${Date()}
ip: ${req.ip}
path: ${req.url.pathname}
msg: 404
__________________________
        `);
        require('./ssejs')(req, res, 404, './err_page/404.ejs', {
            name: name
        });
    }

}
