require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
mongoose.connect("mongodb+srv://vaibhav183:Mongodb@vibhu1@cluster0.zksak.mongodb.net/ProjectData", { useNewUrlParser: true, useUnifiedTopology: true });
const project_schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    mobile: Number,
    education: String,
    address: String,
    dateOfBirth: String,
    pinCode: Number,
    city: String,
    state: String,
    country: String,
    designation: String,
    confidentialId: String,
});

const Project = mongoose.model("Project", project_schema);
var checklogin = "";
var names = [];
var nums = [];
var emails = [];
app.get("/", function(req, res) {
    Project.find(function(err, item) {

        item.forEach(function(val) {
            if (val.confidentialId == "") {
                names.push(val.name)
                nums.push(val.mobile)
                emails.push(val.email)
            }
        });
    });
    res.render("index", { wrongDetail: checklogin });
    checklogin = "";
})

app.post('/login', (req, res) => {
    Project.find({ email: req.body.email1, password: req.body.pass1 }, function(err, item) {
        if (err) return console.log(err);
        else {
            if (item.length != 0) {
                if (item[0].confidentialId == "") {
                    res.render('manager', { fullname: item[0].name, emailval: item[0].email, design: item[0].designation });
                } else {
                    res.render('admin', { name: item[0].name, mangname: names, mangnum: nums, mangemail: emails });
                }
            } else {
                checklogin = "Wrong Details Entered !!";
                res.render("index", { wrongDetail: checklogin })
            }
        }
    })

});

app.post("/signup", function(req, res) {
    var fullname1 = req.body.fname + " " + req.body.mname + " " + req.body.lname;
    const sub = new Project({
        name: fullname1,
        email: req.body.emailname,
        password: req.body.passw1,
        mobile: req.body.mobile,
        education: req.body.education,
        address: req.body.addres,
        dateOfBirth: req.body.date,
        pinCode: req.body.pin,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        designation: req.body.desig,
        confidentialId: ""
    });
    names.push(fullname1)
    nums.push(req.body.mobile)
    emails.push(req.body.emailname)
    sub.save(function(err) {
        if (err) return console.log(err);
        else {
            res.render('manager', { fullname: fullname1, emailval: req.body.emailname, design: req.body.desig });
            console.log("Value Inserted");
        }
    });
});


app.listen(process.env.PORT || 3000, function(err) {
    console.log("server reached at port 3000");
})