const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
const session = require("express-session")

dotenv.config()
const PORT = process.env.PORT || 4000

const app = express()
app.use(express.static("public"))
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
    secret: "$%%^^&^423",
    resave: true,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

mongoose.connect(
    process.env.MONGODB_URL
)

const userSchema = new mongoose.Schema({
    email: String,
    passport: String
})

const Patients = mongoose.model("patients", {
    patient_id: String,
    patient_name: String,
    patient_age: Number,
    patient_address: String,
    patinet_mobileNo: Number,
    patient_disease: String
})

userSchema.plugin(passportLocalMongoose)

const User = new mongoose.model("users", userSchema)

passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.get("/", (req, res) => {
    res.render("index")
})

app.post("/", (req, res) => {
    // User.register({ username: req.body.username }, req.body.password)
    //     .then((user) => {
    //         passport.authenticate("local")(req, res, () => {
    //             res.redirect("/")
    //         })
    //     }).catch(err => {
    //         console.log(err)
    //     })

    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user, (err) => {
        if (err) {
            console.log(err)
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/admin")
            })
        }
    })
})

// let userLoggedIn = true

app.get("/admin", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("admin")

    } else {
        res.redirect("/")
    }
})

app.post("/admin", (req, res) => {
    const patient = new Patients(req.body)

    patient.save().then(() => {
        res.render("success", {
            subTitle: "success",
            subject: "added"
        })
    })
})

app.get("/register", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("register")
    } else {
        res.redirect("/")
    }
})

app.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/")
        }
    })
})

app.get("/search", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("search", {
            option: "Search",
            buttonName: "search",
            url: "search"
        })
    } else {
        res.redirect("/")
    }
})

app.post("/search", (req, res) => {
    Patients.findOne({ patient_id: req.body.patient_id }).then((data) => {
        if (data) {
            res.render("searchResults", data)
        } else {
            res.render("searchFailure", {
                url: "search"
            })
        }
    })
})

app.get("/update", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("search", {
            option: "Update",
            buttonName: "update",
            url: "update"
        })
    } else {
        res.redirect("/")
    }
})

app.post("/update", (req, res) => {
    Patients.findOne({ patient_id: req.body.patient_id }).then((data) => {
        if (data) {
            res.render("updatePage", data)
        } else {
            res.render("searchFailure", {
                url: "update"
            })
        }
    })
})

app.post("/updateResults", (req, res) => {
    Patients.findOneAndUpdate({ patient_id: req.body.patient_id }, req.body).then(() => {
        res.render("success", {
            subTitle: "Updated",
            subject: "updated"
        })
    })
})

app.get("/delete", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("search", {
            option: "Delete",
            buttonName: "Delete",
            url: "delete"
        })
    }
    else {
        res.redirect("/")
    }
})

app.post("/delete", (req, res) => {
    Patients.findOneAndDelete({ patient_id: req.body.patient_id }).then((data) => {
        if (data) {
            res.render("success", {
                subTitle: "Deleted",
                subject: "deleted"
            })
        } else {
            res.render("searchFailure", {
                url: "delete"
            })
        }
    })

})


app.listen(PORT, () => console.log(`server was started on ${PORT} port`))
