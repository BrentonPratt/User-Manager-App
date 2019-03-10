const express = require('express');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const router = express.Router();
const fs = require('fs');

let app = express();
let index;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/*app.use(session({
    secret: 'super secret password',
    saveUninitialized: false,
    resave: false,
    cookie: {maxAge: 600000}
}));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(new GoogleStrategy({
    //options object
    clientID: '576000171055-t7o33msouk0v036vn8fff255u675ai5l.apps.googleusercontent.com',
    clientSecret: 'j5g1x2C4XYQ8Hc1EHgJ8NrmK',
    callbackURL: 'http://localhost:3000/auth/google/callback'
},(req, accessToken, refreshToken, profile, done) => {
    //callback
    done(null, profile);
}));

router.route('/google/callback')
    .get(passport.authenticate('google', {
        successRedirect: '/userListing',
        failure: '/'
}));

router.route('/google')
    .get(passport.authenticate('google', {
        scope: ['profile']
    }));

app.use('/auth', router);*/

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/addUser', (req, res) => {
    res.render('addUser');
});

app.get('/newUser', (req, res) => {
    fs.readFile(path.join(__dirname, 'users.json'), 'utf-8', (err, data) => {
        if (err) throw err;
        let obj = JSON.parse(data);

        obj.users.push({"userID": req.query.userID, "name": req.query.name, "email": req.query.email, "age": req.query.age});

        fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(obj), 'utf-8', (err) => {
            if (err) throw err;
        });
        res.send(`${req.query.name} added as ${req.query.userID} and ${req.query.email}. <a href="/userListing">User list</a>`);
    });
});

app.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
});

app.get('/userListing', (req, res) => {
    /*if (req.user && !users.some(user => user.displayName === req.user.displayName)){
        users.push(req.user);
        console.log(req.user);
        res.render('userListing', {users: users});
    } else {
        res.send(`<a href='/'>Login again</a>`)
    }*/
    fs.readFile(path.join(__dirname, 'users.json'), 'utf-8', (err, data) => {
        if (err) throw err;
        let obj = JSON.parse(data);

        res.render('userListing', {users: obj.users})
    });
});

app.get('/editUser*', (req, res) => {
    let editee;
    let data = fs.readFileSync(path.join(__dirname, 'users.json'), 'utf-8');
    let obj = JSON.parse(data);
    for(let i = 0; i < obj.users.length; i++){
        if(obj.users[i].userID == req.query.userID) {
            index = i;
            editee = obj.users[i];
            console.log(editee);
            res.render('editUser',
                {userID: editee.userID,
                    name: editee.name,
                    email: editee.email,
                    age: editee.age}
            );
            break;
        }
    }
});

app.get('/changeUser*', (req, res) => {
    let data = fs.readFileSync(path.join(__dirname, 'users.json'), 'utf-8');
    let obj = JSON.parse(data);
    console.log(index);
    obj.users.splice(index, 1, {"userID": req.query.userID, "name": req.query.name, "email": req.query.email, "age": req.query.age});
    fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(obj), 'utf-8', (err) => {
        if (err) throw err;
    });
    res.send(`${req.query.name} changed to ${req.query.userID} and ${req.query.email}. <a href="/userListing">User list</a>`);
});

app.get('/deleteUser*', (req, res) => {
    let data = fs.readFileSync(path.join(__dirname, 'users.json'), 'utf-8');
    let obj = JSON.parse(data);
    for (let i = 0; i < obj.users.length; i++) {
        if (obj.users[i].name == req.query.name) {
            obj.users.splice(i, 1);
            fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(obj), 'utf-8', (err) => {
                if (err) throw err;
            });
            res.send(`user: ${req.query.name} was deleted. <a href="/userListing">User list</a>`);
        }
    }
});

/*
    fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(obj), 'utf-8', (err) => {
        if (err) throw err;
        res.end(`User ${req.query.first} ${req.query.last} added, with email ${req.query.email}`);
    });

});*/

app.listen(3000, () => {
    console.log('listening on port 3000');
});