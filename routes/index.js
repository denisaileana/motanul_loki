var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('Pagini/index');
});
//aici astept orice tip de cerere (caracterul special * care tine loc de orice sir)
router.get('/*', function(req, res, next) {

    res.render('Pagini/' + req.url, function(err, rezRandare) {
        if (err) { //intra doar cand avem eroare
            next();
        } else {
            res.send(rezRandare);
        }
    }); //afisez pagina ceruta dupa localhost:3000
});

module.exports = router;