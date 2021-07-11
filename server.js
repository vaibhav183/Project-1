require('dotenv').config();
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
var multer = require('multer'); // For file purpose
const path = require('path');
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.set("view engine", "ejs");
app.use(express.static("public"));
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
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
    filename: {
        type: Array,
        unique: true,
        required: true
    },
    // contentType: {
    //     type: String,
    //     required: true
    // },
    // imageBase64: {
    //     type: String,
    //     required: true
    // },
    confidentialId: String,
});

const Project = mongoose.model("Project", project_schema);
var checklogin = "";
var names = [];
var nums = [];
var emails = [];

//storage configuration
var storage = multer.diskStorage({
    destination: (req, file, cb) => { //cb for callback
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
var upload = multer({ storage: storage });
// var stored = upload.fields({ name: "files1", maxCount: 10 });

var accountSid = process.env.TWILIO_ACCOUNT_SID;
var authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);




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
    res.render("index", { wrongDetail: checklogin, signupd: "" });
    checklogin = "";
})

app.post('/login', (req, res) => {
    if ((req.body.email1 != "" && req.body.pass1 != "") || (req.body.email2 != "" && req.body.pass2 != "")) {
        Project.find({ email: req.body.email1, password: req.body.pass1 }, function(err, item) {
            if (err) return console.log(err);
            else {
                if (item.length != 0) {
                    if (item[0].confidentialId == "") {
                        res.render('manager', { fullname: item[0].name, emailval: item[0].email, mobile: item[0].mobile });
                    } else {
                        res.render('admin', { name: item[0].name, mangname: names, mangnum: nums, mangemail: emails });
                    }
                } else {
                    checklogin = "Wrong Details Entered !!";
                    res.render("index", { wrongDetail: checklogin, signupd: "" })
                    checkloginlogin = "";
                }
            }
        })
    } else { res.render("index", { wrongDetail: "Enter Your Details First", signupd: "" }); }

});
var fullname1;
var emailnam;
var pass;
var numb;
var edu;
var add;
var dob;
var pin;
var cit;
var stat;
var count;
var fils;
var conf;
var num;


app.post("/signup", upload.array("files1", 12), function(req, res) {
    num = (Math.floor(Math.random() * 1000000));
    client.messages
        .create({
            body: 'This is verification code for you....' + num + ' Use this for verification.',
            from: '+17254449637',
            to: '+91' + req.body.mobile,
        })
        .then(message => console.log("message sent"));

    const files = req.files; // req.files is array of `photos` files
    let imgArray = files.map((file) => {
        let img = fs.readFileSync(file.path);
        return encoded_img = img.toString('base64');
    });
    // res.json(imgArray);
    imgArray.map((src, index) => {
        let finalimage = {
            filename: files[index].originalname,
            contentType: files[index].mimetype,
            imageBase64: src
        }
    })
    fullname1 = req.body.fname + " " + req.body.mname + " " + req.body.lname;
    emailnam = req.body.emailname;
    pass = req.body.passw1;
    numb = req.body.mobile;
    edu = req.body.education;
    add = req.body.addres;
    dob = req.body.date;
    pin = req.body.pin;
    cit = req.body.city;
    stat = req.body.state;
    count = req.body.country;
    fils = imgArray;
    conf = "";
    res.render("welcome", { verify_otp: num });
    // names.push(fullname1)
    // nums.push(req.body.mobile)
    // emails.push(req.body.emailname)
    // sub.save(function(err) {
    //     if (err) return console.log(err);
    //     else {
    //         res.render('manager', { fullname: fullname1, emailval: req.body.emailname, mobile: req.body.mobile });
    //         console.log("Value Inserted");
    //     }
    // });
});

app.post("/success", function(req, res) {
    // if (req.body.otp_value != num) {
    //     res.render("index", { wrongDetail: checklogin, signupd: "Wrong OTP Entered!! Register Again" });
    // } else {
    names.push(fullname1)
    nums.push(numb)
    emails.push(emailnam)
    var sub = new Project({
        name: fullname1,
        email: emailnam,
        password: pass,
        mobile: numb,
        education: edu,
        address: add,
        dateOfBirth: dob,
        pinCode: pin,
        city: cit,
        state: stat,
        country: count,
        filename: fils,
        confidentialId: "",
    });
    sub.save(function(err) {
        if (err) return console.log(err);
        else {
            res.render('manager', { fullname: fullname1, emailval: emailnam, mobile: numb });
            console.log("Value Inserted");
        }
    });
    // }
})


app.listen(process.env.PORT || 3000, function(err) {
    console.log("server reached at port 3000");
})