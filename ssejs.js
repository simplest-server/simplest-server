const ejs = require('ejs');
const fs = require('fs');
module.exports = function (path, data) {
    return new Promise(function (resolve, reject) {
        fs.exists(path, function (exists) {
            if (!exists) {
                reject('path is not found')
            }
        });
    })
    ejs.renderFile('./index.ejs', {users: users}, function (err, str) {
        if (err) {
            console.log(err);
        } else {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(str);
            res.end();
        }
    })
}
