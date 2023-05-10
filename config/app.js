const express = require('express')
const ejs = require('ejs')

const app = express()
app.use(express.static('public'))
app.set('view engine', 'ejs')

PORT = 3000

var authUser = {}
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12asdfg12',
    database: 'MyDB'
});

connection.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных: ', err);
        return;
    }
    console.log('Подключение к базе данных успешно!');
});

app.use(express.urlencoded({ extended: true }));

app.post('/login', (req, res) => {
    const { user, pass } = req.body;
    connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [user, pass], (err, results) => {
        if (err) {
            console.error('Ошибка выполнения запроса: ', err);
            return res.status(500).send('Ошибка сервера');
        }
        if (results.length > 0) {
            // Пользователь найден
            authUser = {
                id: results[0].id,
                username: results[0].username,
                phone_number: results[0].phone_number,
                full_name: results[0].full_name,
                isAdmin: false
            };
            res.redirect('/main_page');
        } else {
            // Пользователь не найден, проверяем администраторов
            connection.query('SELECT * FROM admins WHERE username = ? AND password = ?', [user, pass], (err, results) => {
                if (err) {
                    console.error('Ошибка выполнения запроса: ', err);
                    return res.status(500).send('Ошибка сервера');
                }
                if (results.length > 0) {
                    // Администратор найден
                    authUser = {
                        id: results[0].id,
                        username: results[0].username,
                        phone_number: results[0].phone_number,
                        full_name: results[0].full_name,
                        isAdmin: true
                    };
                    res.redirect('/main_page');
                } else {
                    // Неверный логин или пароль
                    res.render("./login", { error: 'Неверный логин или пароль'});
                }
            });
        }
    });
});



app.get('/login', (req, res) => {
    res.render("./login", {error: ''})
})

app.get('/registration', (req, res) => {
    res.render("./registration", { errorLog: '', errorInput: ''})
})

const { validateUsername, validatePassword, validateFullName, validatePhoneNumber } = require('../public/script/validatorsReg.js');

app.post('/registration', (req, res) => {
    const { user, password, phone_number, full_name } = req.body;
    
    // Валидация логина
    const usernameError = validateUsername(user);
    if (usernameError) {
        return res.render("./registration", { errorLog: '', errorInput: usernameError});
    }

    // Валидация пароля
    const passwordError = validatePassword(password);
    if (passwordError) {
        return res.render("./registration", { errorLog: '', errorInput: passwordError});
    }

    // Валидация полного имени
    const fullNameError = validateFullName(full_name);
    if (fullNameError) {
        return res.render("./registration", { errorLog: '', errorInput: fullNameError});
    }

    // Валидация номера телефона
    const phoneNumberError = validatePhoneNumber(phone_number);
    if (phoneNumberError) {
        return res.render("./registration", { errorLog: '', errorInput: phoneNumberError});
    }
  
    // Проверяем, есть ли уже пользователь с таким логином
    connection.query('SELECT * FROM users WHERE username = ?', [user], (err, results) => {
        if (err) {
            console.error('Ошибка выполнения запроса: ', err);
            return res.status(500).send('Ошибка сервера');
        }

        if (results.length > 0) {
            // Если пользователь уже существует, выдаем ошибку
            const newUser = { username: user, password, phone_number, full_name };
            res.render("./registration", { errorLog: 'Логин Занят ', errorInput: ''});
        }
        else 
        {
        // Если пользователь не найден, добавляем его в базу данных
        const newUser = { username: user, password, phone_number, full_name };
        
        connection.query('INSERT INTO users SET ?', newUser, (err, result) => {
            if (err) {
                console.error('Ошибка выполнения запроса: ', err);
                return res.status(500).send('Ошибка сервера');
            }
            authUser = 
            {
                id: result.insertId,
                username: user,
                phone_number,
                full_name,
                isAdmin: false
            }
            // Если пользователь успешно добавлен в базу данных, перенаправляем его на главную страницу
            res.redirect('/main_page');
        });
    }
    });
});

app.get('/main_page', (req, res) => {
    if (typeof authUser.id !== "undefined")
    {
        res.render("./main_page", {user: authUser})
    }
    else 
    {
        res.redirect('/login')
    }
})

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}/login`)
})