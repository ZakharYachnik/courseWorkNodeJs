const express = require('express')
const ejs = require('ejs')
const multer = require('multer');


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

app.post('/save', (req, res) => {
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
                    console.log(__dirname)
                    res.render("./login", { error: 'Неверный логин или пароль'});
                }
            });
        }
    });
});

app.get('/login', (req, res) => {
    authUser = {}
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

app.get('/administration', (req, res) =>{
    connection.query('SELECT * FROM users ',(err, results) => {
        if (err) {
            console.error('Ошибка выполнения запроса: ', err);
            return res.status(500).send('Ошибка сервера');
        }

        const numUsers = results.length;
        const users = results.map((user) => {
            return {
                id: user.id,
                username: user.username,
                phone_number: user.phone_number,
                full_name: user.full_name
            };
        });

        res.render('./administration', {users, numUsers, errorInput: '', successfulDel: ''})
    });
})

app.post('/administration', (req, res) =>{
    const userId = req.body['del_id'];
    connection.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
        if (results.length > 0) {
            connection.query('DELETE FROM cars WHERE userid = ?', [userId], (err, results) => {
                if (err) {
                    console.error('Ошибка выполнения запроса: ', err);
                    return res.status(500).send('Ошибка сервера');
                }
                connection.query('DELETE FROM users WHERE id = ?', [userId], (err, results) => {
                    if (err) {
                        console.error('Ошибка выполнения запроса: ', err);
                        return res.status(500).send('Ошибка сервера');
                    }
                    connection.query('SELECT * FROM users ',(err, results) => {
                        if (err) {
                            console.error('Ошибка выполнения запроса: ', err);
                            return res.status(500).send('Ошибка сервера');
                        }
                
                        const numUsers = results.length;
                        const users = results.map((user) => {
                            return {
                                id: user.id,
                                username: user.username,
                                phone_number: user.phone_number,
                                full_name: user.full_name
                            };
                        });
                
                        res.render('./administration', {users, numUsers, errorInput: '', successfulDel: 'Аккаунт пользователя успешно удален'})
                    });
                })
            })
        }
        else 
        {
            connection.query('SELECT * FROM users ',(err, results) => {
                if (err) {
                    console.error('Ошибка выполнения запроса: ', err);
                    return res.status(500).send('Ошибка сервера');
                }
        
                const numUsers = results.length;
                const users = results.map((user) => {
                    return {
                        id: user.id,
                        username: user.username,
                        phone_number: user.phone_number,
                        full_name: user.full_name
                    };
                });
        
                res.render('./administration', {users, numUsers, errorInput: 'Пользователя с таким id не существует', successfulDel: ''})
            });
        }
    })
})

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

app.get('/publication', (req, res) => {
    if (typeof authUser.id === "undefined")
    {
        res.redirect('/login')
    }
    else 
    {
    res.render("./publication", {error: ''})
    }
})


var imgName = '';

const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function(req, file, cb) {
        const extension = file.originalname.split('.').pop();
        imgName = Date.now() + '.' + extension
        cb(null, imgName);
    }
  });
  
  const upload = multer({storage: storage});
  
  var car
  // маршрут для загрузки файла
app.post('/publication', upload.single('file'), function(req, res) {
    
    console.log("Файл успешно загружен")

    car = { make, model, year, body_type, engine_type, drive_type, transmission, price, currency, payment_method, description } = req.body;
    if (!make || !model || !year || !body_type || !engine_type || !drive_type || !transmission || !price || !currency || !payment_method || imgName == '') {
        // Отображаем сообщение об ошибке на той же странице
        res.render('./publication', { error: 'Пожалуйста заполните все поля' });
    }
    else{
        car.path = imgName
        imgName = ''
        car.userid = authUser.id
        console.log(car)
        const sql = `INSERT INTO cars (make, model, year, body_type, engine_type, drive_type, transmission, price, currency, payment_method, description, path, userid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [car.make, car.model, car.year, car.body_type, car.engine_type, car.drive_type, car.transmission, car.price, car.currency, car.payment_method, car.description, car.path, car.userid];
        connection.query(sql, values, (err, result) => {
            if (err) throw err;
            console.log('Запись добавлена в таблицу cars');
        });
    }
    
});


app.get('/catalog', (req, res) =>{
    if (typeof authUser.id === "undefined")
    {
        res.redirect('/login')
    }
    else 
    {
    connection.query('SELECT * FROM cars ORDER BY id DESC', (error, results) => {
        if (error) {
            console.error('Ошибка выполнения запроса: ', error);
            return;
        }

        // Сохранение количества публикаций в переменной numPublications
        const numPublications = results.length;

        // Преобразование результатов запроса в массив объектов cars
        const cars = results.map((car) => {
            return {
                id: car.id,
                userid: car.userid,
                make: car.make,
                model: car.model,
                year: car.year,
                body_type: car.body_type,
                engine_type: car.engine_type,
                drive_type: car.drive_type,
                transmission: car.transmission,
                price: car.price,
                currency: car.currency,
                payment_method: car.payment_method,
                description: car.description,
                path: car.path
            };
        });

        
        res.render('./catalog', { cars, numPublications, user: authUser });
    });
    }
})
  

app.post('/filter', (req, res) =>{
    const make = req.body['make-filter'];
    const model = req.body['model-filter'];
    const yearFrom = req.body['year-from-filter'];
    const yearTo = req.body['year-to-filter'];
    const priceFrom = req.body['price-from-filter'];
    const priceTo = req.body['price-to-filter'];
    const engineType = req.body['engine-type-filter'];
    const driveType = req.body['drive-type-filter'];
    const currency = req.body['currency-type-filter'];

    // Формирование запроса выборки с учетом выбранных значений
    let query = 'SELECT * FROM cars WHERE 1=1'; // Здесь 1=1 используется как заглушка для начала запроса

    // Добавление условий фильтрации, если значения присутствуют
    if (make) {
        query += ' AND make = ?';
    }

    if (model) {
        query += ' AND model = ?';
    }

    if (yearFrom) {
        query += ' AND year >= ?';
    }

    if (yearTo) {
        query += ' AND year <= ?';
    }

    if (priceFrom) {
        query += ' AND price >= ?';
    }

    if (priceTo) {
        query += ' AND price <= ?';
    }

    if (engineType) {
        query += ' AND engine_type = ?';
    }

    if (driveType) {
        query += ' AND drive_type = ?';
    }

    if (currency) {
        query += ' AND currency = ?';
    }

    query += ' ORDER BY id DESC'

    const queryParams = [];
    if (make) {
        queryParams.push(make);
    }

    if (model) {
        queryParams.push(model);
    }

    if (yearFrom) {
        queryParams.push(yearFrom);
    }

    if (yearTo) {
        queryParams.push(yearTo);
    }

    if (priceFrom) {
        queryParams.push(priceFrom);
    }

    if (priceTo) {
        queryParams.push(priceTo);
    }

    if (engineType) {
        queryParams.push(engineType);
    }

    if (driveType) {
        queryParams.push(driveType);
    }

    if (currency) {
        queryParams.push(currency);
    }

    connection.query(query, queryParams, (err, results) => {
        // Обработка результатов выборки
        // ...
        const numPublications = results.length;

        const cars = results.map((car) => {
            return {
                id: car.id,
                userid: car.userid,
                make: car.make,
                model: car.model,
                year: car.year,
                body_type: car.body_type,
                engine_type: car.engine_type,
                drive_type: car.drive_type,
                transmission: car.transmission,
                price: car.price,
                currency: car.currency,
                payment_method: car.payment_method,
                description: car.description,
                path: car.path
            };
        });
        console.log(cars)
        res.render('./catalog', { cars, numPublications, user: authUser });
      });
})

app.get('/catalog/:id', (req, res) =>{
    if (typeof authUser.id === "undefined")
    {
        res.redirect('/login')
    }
    else 
    {
    var id = req.params.id;
    var car = []
    var owner = {}
    var comments = []
    connection.query('SELECT * FROM cars WHERE id = ?', [id], (error, results) => {
        if (error) {
          console.log(error);
          return res.status(500).send('Ошибка сервера');
        }
        car = results[0];
        console.log(car.path)
        connection.query('SELECT * FROM users WHERE id = ?', [car.userid], (error, results) => {
            if (error) {
              console.log(error);
              return res.status(500).send('Ошибка сервера');
            }
            owner = results[0];
            console.log(owner.full_name)
            connection.query('SELECT * FROM comments WHERE carid = ? ORDER BY id DESC', [id], (error, results) => {
                if (error) {
                  console.log(error);
                  return res.status(500).send('Ошибка сервера');
                }
                
                comments = results.map((comment) => {
                    return{
                        username: comment.username,
                        text: comment.comment
                    }
                })
                
                console.log(comments)
                res.render('./checkCar', {car: car, owner: owner, user: authUser, comments: comments})
            })
        });
    });
    }
})

app.post('/catalog/:id', (req, res) =>{
    var comment = req.body['writed-comment'];
    var carId = req.params.id;
    var userName = authUser.username
    console.log(comment)
    console.log(carId)
    console.log(userName)  
    const sql = `INSERT INTO comments (userName, carid, comment) VALUES (?, ?, ?)`;
    const values = [userName, carId, comment];
    connection.query(sql, values, (err, result) => {
            if (err) throw err;
            console.log('Запись добавлена в таблицу comments');
    });
    res.redirect('/catalog/' + carId)
})

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}/login`)
})

