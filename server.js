//Constent variables.
const express = require('express')
const bodyParser = require('body-parser')
const requestObj = require('request');
const mongoose = require("mongoose");
const { static } = require('express');
const { post } = require('request');
const PORT = process.env.PORT || 3000
const url = "mongodb://localhost:27017/ToDoListDB";

const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"))
app.set("view engine", "ejs")

//Mongo connection 
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
    console.log("MongoDB COnnected Successfully");
});
//end here 

//MongoDB Schema 
const toDolistSchema = new mongoose.Schema({
    Name: {
        required: true,
        type: String
    },
});

const customListSchema = mongoose.Schema({
    listName: {
        type: String,
        required: true,
    },
    listItem: [toDolistSchema],
})
//Create Model
const ToDoItem = mongoose.model("ToDoItem", toDolistSchema);
const CustomList = mongoose.model("CustomItem", customListSchema);
//end here 

var day = '';
var today = new Date();

var options = {
    weekday: "long",
    month: "long",
    day: "numeric"
}
day = today.toLocaleDateString("en-US", options)
app.get('/favicon.ico', (req, res) => res.status(204));
app.get("/", (req, res) => {
    ToDoItem.find({}, (err, item) => {
        if (err) {
            console.log("error occur in find " + err);
        } else {
            res.render('list', {
                KindOfDay: day,
                toDolistItem: item
            })
        }
    });
});

app.post("/", (req, res) => {
    ToDoItem.insertMany(new ToDoItem({
        Name: req.body.toDoItem
    }), (err) => {
        if (err) {
            console.log("Error occurs : " + err);
        } else {
            console.log("Successfully inserted..");
        }
    });
    res.redirect("/");
});

app.post('/delete', function (req, res) {
    let itemId = req.body.checkbox
    ToDoItem.deleteOne({ _id: itemId }, (err) => {
        if (err) {
            console.log("Error occur " + err);
        } else {
            console.log("Record Deleted..");
            res.redirect("/");
        }
    });
});
const customListItem = new ToDoItem({
    Name: "XYZ",
});

app.get('/:customParam', (req, res) => {
    let reqParam = req.params.customParam;   
let item = [];
    CustomList.findOne({listName:reqParam}, (err, found) => {
        if (!found) {
            CustomList.insertMany(new CustomList({
                listName:reqParam,
                listItem:customListItem
            }), (err) => {
                if (err) {
                    console.log("Error occurs " + err);
                } else {
                    console.log("Successfully inserted " + reqParam);
                    res.redirect("/");
                }
            });
        } else {            
            found.listItem.push(new ToDoItem({
                Name: "Shavez",
            }));
            CustomList.updateMany(found, (err) => {
                if (err) {
                    console.log("Error occurs " + err);
                } else {
                    console.log("Successfully inserted " + reqParam);
                    res.redirect("/");
                }
            });
        }
    });

    
})

app.listen(PORT, () => {
    console.log("Server started on port " + PORT)
})
