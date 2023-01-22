const ejs = require("ejs");
const path = require("path");
const fs = require('fs');
const config = require("./config.json");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const app = express();

const dataDir = path.resolve(`${process.cwd()}${path.sep}`);
const templateDir = path.resolve(`${dataDir}${path.sep}templates`);

app.engine("ejs", ejs.renderFile);
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
);

app.use("/", express.static(path.resolve(`${dataDir}${path.sep}assets`)));
app.use("/api", express.static(path.resolve(`${dataDir}${path.sep}api`)));

const renderTemplate = (res, req, template, data = {}) => {
    
    const baseData = {
        path: req.path,
    };

    res.render(
        path.resolve(`${templateDir}${path.sep}${template}`),
        Object.assign(baseData, data),
    );
};

app.get("/", (req, res) => {
    let contests = require("./api/jacobcontests.json");

    renderTemplate(res, req, "main.ejs", {
        contests,
    })
});

app.post("/api/jacobcontests", (req, res) => {
    if (req.body.secret !== config.apiKey) {
        res.status(401);
        res.send('Wrong key');
    } else {
        let events = JSON.stringify(req.body.events);

        fs.writeFile("./api/jacobcontests.json", events, "utf-8", function (err) {
            if (err) {
                res.status(500);
                res.send("Could not update contests");
                return console.log(err);
            }

            console.log("Contests updated!")
            res.status(200);
            res.send('Data uploaded');
        });
    }
});

app.listen(config.port, null, null, () =>
    console.log(`Jacobs contests is running on port ${config.port}.`),
);