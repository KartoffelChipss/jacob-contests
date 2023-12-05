const ejs = require("ejs");
const path = require("path");
const fs = require('fs');
const config = require("./config.json");
const express = require("express");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");

const cropNames = require("./cropnames.json");

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

const limiter = rateLimit({
	windowMs: 5 * 60 * 1000,// Timewindow is 5 minutes
	limit: 100,// 100 Requests per "windowMs"
	standardHeaders: 'draft-7', 
	legacyHeaders: false,
});

app.use("/api", limiter)

app.use("/assets", express.static(path.resolve(`${dataDir}${path.sep}assets`)));
//app.use("/api", express.static(path.resolve(`${dataDir}${path.sep}api`)));

if (config.developing === false) {
    app.enable('trust proxy');
} else {
    console.log("Started in development mode");
}

app.use(function(request, response, next) {

    if (config.developing !== true && !request.secure) {
       return response.redirect("https://" + request.headers.host + request.url);
    }

    next();
})

const renderTemplate = (res, req, template, data = {}) => {
    
    const baseData = {
        path: req.path,
    };

    res.render(
        path.resolve(`${templateDir}${path.sep}${template}`),
        Object.assign(baseData, data),
    );
};

let contests = require("./api/jacobcontests.json");

setInterval(() => {
    console.log("Loaded new json file")

    fs.readFile('./api/jacobcontests.json', function read(err, data) {
        if (err) {
            console.log(err)
        }
        const content = JSON.parse(data);
    
        contests = content;
    });
}, 5 * 60 * 1000)

app.get("/", (req, res) => {
    renderTemplate(res, req, "main.ejs", {
        contests,
        cropNames,
    });
});

app.get("/legalnotice", (req, res) => {
    renderTemplate(res, req, "legalnotice.ejs", {});
});

app.get(["/api/jacobcontests", "/api/jacobcontests.json"], (req, res) => {
    fs.readFile('./api/jacobcontests.json', function read(err, data) {
        if (err) {
            console.log(err);
            res.send(500);
            res.send("There was an error whilst reading the contests!");
            return;
        }
        const content = JSON.parse(data);
        contests = content;

        // Filter past contents out
        const now = new Date().getTime();
        const twentyMin = 20 * 60 * 1000;// A contest lasts 20 minutes
        const trimmedcontent = content.filter(c => c.timestamp >= now - twentyMin);

        res.status(200);
        res.send(trimmedcontent);
    });
});

app.post("/api/jacobcontests", (req, res) => {
    if (req.body.secret !== config.apiKey) {
        const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(':').pop();
        console.log(`[AUTH] Someone tried to upload contests with invalid api key! (IP: ${ip})`);
        res.status(401);
        res.send('Invalid api key!');
    } else {
        let events = JSON.stringify(req.body.events);

        if (!events) {
            res.status(400);
            console.log("[UPLOAD] No contests provided!");
            res.send("You need to provide an array of contests!");
            return;
        }

        // if (typeof events !== "object" || Array.isArray(events)) {
        //     res.status(400);
        //     console.log("[UPLOAD] Invalid contests!")
        //     res.send("'contests' must be an array!");
        //     return;
        // }

        console.log("[UPLOADS] New events uploaded")

        fs.writeFile("./api/jacobcontests.json", events, "utf-8", function (err) {
            if (err) {
                res.status(500);
                res.send("[UPLOADS] Could not update contests");
                return console.log(err);
            }

            console.log("[UPLOADS] Updated contests.json")
            res.status(200);
            res.send('[UPLOADS] Data successfully uploaded');
        });

        if (!fs.existsSync("./api/archive")) fs.mkdirSync("./api/archive");

        fs.writeFile(`./api/archive/${new Date().getTime()}.json`, events, "utf-8", function (err) {
            if (err) {
                res.status(500);
                res.send("[UPLOADS] Could not save archive");
                return console.log(err);
            }

            console.log(`[UPLOADS] Archived contests in ${new Date().getTime()}.json`)
            res.status(200);
            res.send('[UPLOADS] Data successfully archived');
        });
    }
});

app.listen(config.port, null, null, () =>
    console.log(`Jacobs contests is running on port ${config.port}.`),
);