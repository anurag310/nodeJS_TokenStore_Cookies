const express = require('express')
const app = express();
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt')
const nocache = require('nocache');


// disable browser caching
app.use(nocache());



mongoose.connect("mongodb://0.0.0.0:27017/connection").then(() => {
  console.log("Database is connected");
}).catch((e) => { console.log(e) })

const testSchema = mongoose.Schema({
  userName: String,
  email: String,
  password: String
});

// to read data from login to api 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use((req, res, next) => {
//   res.header("Cache-Control", "no-cache, no-store, must-revalidate");
//   next();
// });


const testModel = mongoose.model("Model", testSchema);


app.get("/", (req, res) => {
  
  res.render('login.ejs')
})

app.get("/register", (req, res) => {
  res.render('register.ejs')
})

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

app.post("/login", async (req, res) => {
  const data = await testModel.findOne({ email: req.body.email });
  if (!data) return res.render('register.ejs');
  const decryptPassword = await bcrypt.compareSync(req.body.password, data.password);
  //console.log("Decrypt", decryptPassword);

  const id = data._id.toString();
  //console.log(id);
  if (decryptPassword) {
    const createToken = jwt.sign(id, "AnuragKey");
    console.log("Create Token",createToken);
    res.cookie("token", createToken, {
      expires: new Date(Date.now() + 45000), 
      httpOnly: true,
    });
    res.render('index.ejs', { name: 'Anurag' });
  }
  else {
    res.send("Please Provide Correct Password!!!!");
  }
})
app.post("/addUser", async (req, res) => {

  const data = await testModel.findOne({ email: req.body.email });

  if (data) {
    console.log("data",data);
    res.send("Email Already Exists");
    res.render('register.ejs');
  } else {
    const hashedPassword = await bcrypt.hash(req.body.password, 8);
    await testModel.create({ userName: req.body.userName, email: req.body.email, password: hashedPassword });
    console.log(req.body);
    res.send("Registration successful");
  }
})

app.listen(2222, () => {
  console.log("Server is running 2222");
})
