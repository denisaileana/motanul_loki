var express = require('express');
var router = express.Router();

var mysql = require('mysql');

const nodemailer = require("nodemailer");

var conexiune = mysql.createConnection({
    host: "localhost",
    user: "loki",
    password: "parola",
    database: "motanul_loki"
})

conexiune.connect(function (err) {
    if (err) throw err;
    console.log("Ne-am conectat la baza de date!");
});


/* GET home page. */
router.get('/', function (req, res, next) {
    //ma asigur ca e logged in si admin
    if (!res.locals.utilizator || res.locals.utilizator.rol != "admin") {
        throw new Error("Utilizatorul nu este logat!");
    }
    conexiune.query("SELECT * FROM utilizatori WHERE id != ?", [res.locals.utilizator.id], function (err, rezultate) {
        if (err) throw err;
        res.render('Pagini/utilizatori', {rezultate: rezultate});
    });


});


//schimbare rol
router.post("/", function (req, res) {
    //ma asigur ca e logged in si admin
    if (!res.locals.utilizator || res.locals.utilizator.rol != "admin") {
        throw new Error("Utilizatorul nu este logat!");
    }

    if (res.locals.utilizator.id == req.body.id_utilizator) {
        throw new Error("Utilizatorul a incercat sa se saboteze!");
    }

    conexiune.query("SELECT * FROM utilizatori WHERE id = ?", [req.body.id_utilizator], function (err, rezultate) {
        if (err) throw err;

        if (rezultate.length != 1){
            throw new Error("Utilizatorul nu exista!");
        }
        const utilizator=rezultate[0];
        let rol_nou = "comun";
        if (rezultate[0].rol == "comun"){
            rol_nou="admin";
        }
        conexiune.query("UPDATE utilizatori SET rol = ? WHERE id = ?", [rol_nou, rezultate[0].id], function(err, rezultate){
            if (err) throw err;

            nodemailer.createTransport({
                host: "smtp.mailtrap.io",
                port: 2525,
                auth: {
                    user: "e53fb55ebad9f7",
                    pass: "bbfd067b9ab96d"
                }
            }).sendMail({
                from: "ndisample@gmail.com",
                to: utilizator.email,
                subject: "Salut, stimate " + utilizator.nume,
                text: "Ai fost " + (utilizator.rol == "comun" ? "promovat" : "retrogradat") +" la rolul " + rol_nou + " pe site-ul Loki Motanul"

            }).then(function () {
                conexiune.query("SELECT * FROM utilizatori WHERE id != ?", [res.locals.utilizator.id], function (err, rezultate) {
                    if (err) throw err;
                    res.render('Pagini/utilizatori', {rezultate: rezultate});
                });
            });




        });



    });
});

module.exports = router;