var express = require('express');
var router = express.Router();

var mysql = require('mysql');

var conexiune = mysql.createConnection({
    host: "localhost",
    user: "loki",
    password: "parola",
    database: "motanul_loki"
})

conexiune.connect(function(err) {
    if (err) throw err;
    console.log("Ne-am conectat la baza de date!");
});

router.get('/', function(req, res) {
    conexiune.query("SELECT * FROM rase_pisici", function(err, rezultat) {
        if (err) throw err;
        console.log(rezultat);
        res.render('Pagini/rase', { rase: rezultat });
    });

});

router.get('/:idRasa', function(req, res) {
    var idRasa = req.params.idRasa;
    conexiune.query("SELECT * FROM rase_pisici where id=?", [idRasa], function(err, rezultat) {
        if (err) throw err;
        console.log(rezultat);
        res.render('Pagini/rasa', { rasa: rezultat[0] }); //afisez index-ul in acest caz
    });

});


module.exports = router;