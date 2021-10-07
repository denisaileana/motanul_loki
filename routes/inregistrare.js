var express = require('express');
var router = express.Router();

var mysql = require('mysql');

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

const formidable = require('formidable');
const bcrypt = require('bcrypt');
const fs = require('fs');
const nodemailer = require("nodemailer");


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('Pagini/inregistrare');
});

//VERIFICARI SERVER
router.post('/', function (req, res) {
    //console.log(req);

    //luam datele din request folosind formidable
    const formular = formidable.IncomingForm();

    let username;
    let cale = null;
    //luam username-ul din formular si il bagam in variabila username
    //ca sa ii facem un folder in care incarcam poza
    formular.on("field", function (name, value) {
        if (name == "username") {
            username = value;
        }
    });

    //schimbam unde se incarca fisierul
    formular.on("fileBegin", function (name, fisier) {
        //verificam daca exista fisierul si are nume ok
        if (!fisier || !fisier.name) {
            return;
        }
        //unde se incarca
        let caleUpload = __dirname + "/../public/Resurse/Profile/" + username;
        //daca nu exista folderul creeaza folderul
        if (!fs.existsSync(caleUpload)) {
            fs.mkdirSync(caleUpload);
        }
        fisier.path = caleUpload + "/" + fisier.name;
        cale = "/Resurse/Profile/" + username + "/" + fisier.name;

    });

    //campuriText - campurile din formular de tip text/psswrd
    //campuriFisier - campul pentru poza
    formular.parse(req, function (err, campuriText, campuriFisier) {
        //console.log(campuriFisier);

        //verificare completare nume server
        if (campuriText.nume.length == 0) {
            res.render('Pagini/inregistrare', {eroare: 'Nu ai completat numele!'});
            return;
        }

        //verificare completare prenume server
        if (campuriText.prenume.length == 0) {
            res.render('Pagini/inregistrare', {eroare: 'Nu ai completat prenumele!'});
            return;
        }

        //verificare completare username server
        if (campuriText.username.length == 0) {
            res.render('Pagini/inregistrare', {eroare: 'Nu ai completat username-ul!'});
            return;
        }

        //verificare completare parola server
        if (campuriText.parola.length == 0) {
            res.render('Pagini/inregistrare', {eroare: 'Nu ai completat parola!'});
            return;
        }

        //verificare completare matching passwords server
        if (campuriText.confirma_parola.length == 0) {
            res.render('Pagini/inregistrare', {eroare: 'Nu ai completat reintroducerea parolei!'});
            return;
        }

        //verificare completare email server
        if (campuriText.email.length == 0) {
            res.render('Pagini/inregistrare', {eroare: 'Nu ai completat email-ul!'});
            return;
        }

        //verificare daca exista username-ul
        conexiune.query("SELECT * FROM utilizatori WHERE username=?", [campuriText.username], function (err, rezultat) {
            //console.log(err);
            //console.log(rezultat);

            if (err) throw err;

            //daca exista utilizator
            if (rezultat.length > 0) {
                res.render('Pagini/inregistrare', {eroare: 'Utilizatorul deja exista!'});
                return;
            }
            console.log("Scriem");

            //encriptare parola
            let parola_encriptata = bcrypt.hashSync(campuriText.parola, 10);

            conexiune.query("INSERT INTO utilizatori(username, nume, prenume, email, parola, telefon, imagine_profil) values (?,?,?,?,?,?,?)", [
                campuriText.username, campuriText.nume, campuriText.prenume, campuriText.email, parola_encriptata, campuriText.telefon, cale
            ], function (err, results) {
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
                    to: campuriText.email,
                    subject: "Salut, stimate " + campuriText.nume,
                    text: "Username-ul tău este " + campuriText.username + " pe site-ul Loki Motanul",
                    html: "Username-ul tău este " + campuriText.username + " pe site-ul <span style=\"font-weight:bold; text-decoration: underline; font-style:italic;\">Loki Motanul</span>"

                }).then(function () {
                    res.render('Pagini/inregistrare', {succes: true});
                });

            });


        });
    });

});

module.exports = router;