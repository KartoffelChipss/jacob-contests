const ejs = require("ejs");
const path = require("path");
const fs = require('fs');
const config = require("./config.json");
const express = require("express");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const viewsModel = require("./models/viewsmodel");
const visitsManager = require("./util/manageVisits");
require("dotenv").config();
const getContests = require("./util/getContests");

const devMode = process.env.DEVMODE === "true";

const visitsBuffer = {};

const trackStats = config.trackvisits && process.env.MONGO_URI;

if (trackStats) mongoose.connect(process.env.MONGO_URI, {}).then(() => console.log("Connected to database"));

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

const trackViews = async (req, res, next) => {
    try {
        const route = req.path;

        if (!trackStats) return next();

        if (route !== "/" && route !== "/legalnotice") return next();

        const today = new Date();
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // Extracting date portion only

        if (!visitsBuffer[route]) visitsBuffer[route] = {};
        if (!visitsBuffer[route][date]) visitsBuffer[route][date] = 0;

        visitsBuffer[route][date]++;

        next();
    } catch (err) {
        next(err);
    }
};

const flushVisitsBuffer = async () => {
    if (devMode) console.log("Flushing visitsBuffer...");
    const bulkOps = [];

    for (const route in visitsBuffer) {
        for (const date in visitsBuffer[route]) {
            const visitCount = visitsBuffer[route][date];

            bulkOps.push({
                updateOne: {
                    filter: { route, date: new Date(date) },
                    update: {
                        $inc: { count: visitCount }
                    },
                    upsert: true
                }
            });

            delete visitsBuffer[route][date];
        }
    }

    if (bulkOps.length > 0) await viewsModel.bulkWrite(bulkOps);

    if (devMode) console.log("Flushed visitsBuffer")
}

setInterval(flushVisitsBuffer, 60000);

app.use(trackViews);

app.use("/api", limiter);

app.use("/assets", express.static(path.resolve(`${dataDir}${path.sep}assets`)));

if (config.developing === false) {
    app.enable('trust proxy');
} else {
    console.log("Started in development mode");
}

app.use(function (request, response, next) {

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

app.get("/", async (req, res) => {
    renderTemplate(res, req, "main.ejs", {
        contests: await getContests(config.useSkyHanniApi),
        cropNames,
    });
});

app.get("/stats", async (req, res, next) => {
    if (!trackStats) return next();

    renderTemplate(res, req, "stats.ejs", {
        totalVisitsThisYear: await visitsManager.getTotalVisitsThisYear(),
        totalVisitsThisMonth: await visitsManager.getTotalVisitsThisMonth(),
        totalVisitsToday: await visitsManager.getTotalVisitsToday(),
        visitsThisMonth: await visitsManager.getVisitsLast30Days(),
    });
});

app.get("/legalnotice", (req, res) => {
    renderTemplate(res, req, "legalnotice.ejs", {});
});

app.get(["/api/jacobcontests", "/api/jacobcontests.json"], (req, res) => {
    fs.readFile('./api/jacobcontests.json', async function read(err, data) {
        if (err) {
            console.log(err);
            res.send(500);
            res.send("There was an error whilst reading the contests!");
            return;
        }
        const content = await getContests();

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

        console.log("[UPLOADS] New events uploaded");

        let currentFileWritten = false;
        let archiveFileWritten = false;

        const checkAndSendResponse = () => {
            if (currentFileWritten && archiveFileWritten) {
                console.log("[UPLOADS] All files successfully written");
                res.send("[UPLOADS] Data successfully uploaded and archived");
            }
        };
    
        fs.writeFile("./api/jacobcontests.json", events, "utf-8", function (err) {
            if (err) {
                res.status(500);
                res.send("[UPLOADS] Could not update contests");
                return console.log(err);
            }
    
            console.log("[UPLOADS] Updated contests.json");
            currentFileWritten = true;
            checkAndSendResponse();
        });
    
        if (!fs.existsSync("./api/archive")) fs.mkdirSync("./api/archive");
    
        const archiveFileName = `./api/archive/${new Date().getTime()}.json`;
        fs.writeFile(archiveFileName, events, "utf-8", function (err) {
            if (err) {
                res.status(500);
                res.send("[UPLOADS] Could not save archive");
                return console.log(err);
            }
    
            console.log(`[UPLOADS] Archived contests in ${archiveFileName}`);
            archiveFileWritten = true;
            checkAndSendResponse();
        });
    }
});

app.listen(config.port, null, null, () =>
    console.log(`Jacobs contests is running on port ${config.port}.`),
);