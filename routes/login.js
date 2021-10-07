var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('Pagini/login');
});

var mysql = require('mysql');
const bcrypt = require('bcrypt');

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

router.post('/', function(req, res) {
    conexiune.query("SELECT * FROM utilizatori WHERE username=?", [req.body.username], function(err, rezultat) {

        if (err) throw err;

        //daca nu exista utilizatorul
        if (rezultat.length != 1) {
            res.render('Pagini/login', { eroare: true });
            return;
        }

        //daca exista verificam parola
        const parola_criptata = rezultat[0].parola;
        const verificare_parola = bcrypt.compareSync(req.body.parola, parola_criptata);
        if (verificare_parola == false) {
            res.render('Pagini/login', { eroare: true });
            return;
        }

        //pun datele utilizatorului din baza de date in sesiune
        req.session.utilizator = rezultat[0];
        if (rezultat[0].rol=="admin"){
            res.redirect('/utilizatori');
        }else {
            res.render('Pagini/login', {utilizator: rezultat[0]});
        }
    });
});


module.exports = router;