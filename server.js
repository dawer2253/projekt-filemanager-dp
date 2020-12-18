var express = require("express")
var app = express()
const PORT = 3000;
var path = require("path")
var bodyParser = require("body-parser")
var hbs = require('express-handlebars')
var formidable = require('formidable');

app.use(express.static('static'))
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));         // ustalamy katalog views
app.engine('hbs', hbs({
    defaultLayout: 'main.hbs', helpers: {
        imageExtension: function (type) {
            switch (type) {
                case "text/plain":
                    return "/gfx/txt.png"
                    break;
                case "image/jpeg":
                    return "/gfx/jpg.png"
                    break;
                case "audio/mpeg":
                    return "/gfx/mp3.png"
                    break;
                case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                    return "/gfx/doc.png"
                    break;
                case "application/zip":
                    return "/gfx/zip.png"
                    break;
                case "image/gif":
                    return "/gfx/gif.png"
                    break;
                default:
                    return "/gfx/default.png"
            }
        }
    }, extname: '.hbs', partialsDir: "views/partials"
}));   // domyślny layout, potem można go zmienić
app.set('view engine', 'hbs');

var file_table = []
var columns = ["id", "image", "name", "type", "size", "", ""]
var index = 1
//file_table.push({id: 1, name: "x", path: "/x/x", size: "123", type: "img", save_date: "1234123"})

app.get("/", function (req, res) {
    res.render("upload.hbs")
})

app.get("/fileManager", function (req, res) {
    content = [file_table, columns]
    res.render("fileManager.hbs", content)
})

app.get("/info/:id", function (req, res) {
    if (req.params.id == "0") {
        res.render("info.hbs", ["", false])
    } else {
        for (var i = 0; i < file_table.length; i++) {
            if (file_table[i].id == req.params.id) {
                var object = file_table[i]
            }
        }
        res.render("info.hbs", [object, true])
    }
})

app.get("/info", function (req, res) {
    res.render("info.hbs")
})

app.post("/upload", function (req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = __dirname + '/static/upload/'       // folder do zapisu zdjęcia
    form.keepExtensions = true                           // zapis z rozszerzeniem pliku
    form.multiples = true                                // zapis wielu plików
    form.parse(req, function (err, fields, files) {
        if (Array.isArray(files.files)) {
            for (var i = 0; i < files.files.length; i++) {
                var object = {}
                object.id = index
                object.name = files.files[i].name
                object.path = files.files[i].path
                object.size = files.files[i].size
                object.type = files.files[i].type
                object.save_date = files.files[i].lastModifiedDate
                object.generatedName = path.basename(files.files[i].path)
                file_table.push(object)
                index++
            }
        } else {
            var object = {}
            object.id = index
            object.name = files.files.name
            object.path = files.files.path
            object.size = files.files.size
            object.type = files.files.type
            object.save_date = files.files.lastModifiedDate
            object.generatedName = path.basename(files.files.path)
            file_table.push(object)
            index++
        }
    });

    res.redirect("/")
})

app.post("/delete/:id", function (req, res) {
    new_table = []
    for (var i = 0; i < file_table.length; i++) {
        if (file_table[i].id != req.params.id) {
            new_table.push(file_table[i])
        }
    }
    file_table = new_table
    res.redirect("/fileManager")
})

//nasłuch na określonym porcie
app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT)
})
