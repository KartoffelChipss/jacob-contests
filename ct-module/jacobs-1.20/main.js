// <reference types="../CTAutocomplete" />
// <reference lib="es2015" />
module.exports = {};
import request from '../requestV2';

// This is a Chattrigers module!
// This is for Chattriggers 3.0.0 fabric

// Enter your api key, that you set in the config.json of the webserver
const apiKey = "ENTER API KEY HERE";

// good luck using this lmao
// open the calendar, press h, go to next page and repeat until you get to the last page
// then use /uploadjacobdata

const itemsEnum = {
    'Cactus': 0,
    'Carrot': 1,
    'Cocoa Beans': 2,
    'Melon': 3,
    'Mushroom': 4,
    'Nether Wart': 5,
    'Potato': 6,
    'Pumpkin': 7,
    'Sugar Cane': 8,
    'Wheat': 9,
}

function unformat(name) {
    if (typeof name === 'string') return name;
    return name.unformattedText;
}

function parseTime(timeStr) {
    return timeStr.split(' ').reduce((prev, cur) => {
        let t = cur.charAt(cur.length - 1);
        let s = parseInt(cur.slice(0, -1), 10);
        switch (t) {
            case 'h':
                s *= 60;
            case 'm':
                s *= 60;
        }
        return prev + s;
    }, 0);
}

let jacobs = [];
let foundToday = false;

function scanCalendar(inventory) {
    let totalFound = 0;

    for (let item of inventory.getItems()) {
        if (item == null || item.type == null) continue;

        if (foundToday) {
            let lore;

            try {
                lore = item.getLore();
            } catch (error) {
                continue;
            }

            for (let i = 0; i < lore.length; ++i) {
                const loreLine = lore[i].unformattedText;

                let match = loreLine.match(/Jacob's Farming Contest \((.+)\)/);
                if (!match) continue;

                let time;
                // If the time is not specified, we assume it's the same time as the last one + 1 hour
                if (jacobs.length && jacobs[jacobs.length - 1] && jacobs[jacobs.length - 1].time) {
                    time = jacobs[jacobs.length - 1].time + 60 * 60 * 1000;
                } else {
                    time = parseTime(match[1]) * 1000 + Date.now();
                    if (jacobs[0] && jacobs[0].time === null) {
                        jacobs[0].time = time - 60 * 60 * 1000;
                    }
                }

                const crops = lore.slice(i + 1, i + 4).map(i => unformat(i).slice(2)).map(i => itemsEnum[i]);

                jacobs.push({
                    time,
                    crops,
                });

                totalFound++;
                break;
            }
        } else if (item.type.getRegistryName() === "minecraft:lime_dye") {
            foundToday = true;
            let lore = item.getLore();
            lore = lore.map(i => i.unformattedText);
            if (lore.length > 1) {
                if (unformat(lore[1]).includes('Jacob\'s Farming Contest')) {// Today is a contest day
                    console.log("Today is a contest day");
                    const crops = lore.slice(2, 5).map(i => i.slice(2)).map(i => itemsEnum[i]);

                    jacobs.push({
                        time: null,
                        active: true,
                        crops,
                    });
                }
            }
        }
    }

    return totalFound;
}

register('guiKey', (char, keyCode, gui, event) => {
    if (keyCode === 35 || char === "h") { // h
        let inv = Player.getContainer();
        let name = String(inv.getName());
        if (name.match(/(?:Early )?(?:Summer|Winter|Spring|Autumn), Year \d+/)) {
            ChatLib.chat('§8-> §7Scanning...');
            const amount = scanCalendar(inv);
            ChatLib.chat(`§8-> §aFinished scanning §8(§7${amount} contests§8)`);
        }
    }
});

function formatDuration(duration) {
    let timeRemainingStr;

    if (duration > 0) {
        const seconds = Math.floor((duration / 1000) % 60);
        const minutes = Math.floor((duration / 1000 / 60) % 60);
        const hours = Math.floor((duration / 1000 / 60 / 60) % 24);
        const days = Math.floor(duration / 1000 / 60 / 60 / 24);

        timeRemainingStr = 
            (days > 0 ? `${days}d ` : "") +
            (hours > 0 ? `${hours}h ` : "") +
            (minutes > 0 ? `${minutes}m ` : "") +
            (seconds > 0 ? `${seconds}s` : "").trim();
    } else {
        timeRemainingStr = "Ended";
    }

    return timeRemainingStr;
}

register("command", () => {
    console.log(JSON.stringify(jacobs, null, 2));
    ChatLib.chat("§7" + JSON.stringify(jacobs, null, 2));
}).setName("printjacobdata");

register("command", () => {
    ChatLib.chat("\n§a§lJacob's Farming Contest data:\n");
    for (let i of jacobs) {
        if (i.time) {
            const timeRemaining = i.time - Date.now();
            ChatLib.chat("§3" + new Date(i.time).toLocaleString() + ` §8(§7in ${formatDuration(timeRemaining)}§8) ` + "\n §8> §2" + i.crops.map(i => Object.keys(itemsEnum)[i]).join("§8, §2"));
        } else {
            ChatLib.chat("§7Today - " + i.crops.map(i => Object.keys(itemsEnum)[i]).join(", "));
        }
    }
    ChatLib.chat("\n§7Total: §a" + jacobs.length + " contests\n");
}).setName("prettyprintjacobdata");

register("command", () => {
    if (!apiKey || apiKey === "PUT YOUR KEY HERE!") {
        ChatLib.chat("§4Failed to upload data");
        ChatLib.chat("You need to set your api key in the 'main.js'!");
        return;
    }

    request({
        url: 'https://jacobs.strassburger.dev/api/jacobcontests',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36'
        },
        method: 'POST',
        body: {
            secret: apiKey,
            events: jacobs.map(i => {
                return {
                    timestamp: Math.floor(i.time),
                    crops: i.crops,
                };
            })
        }
    })
        .catch(err => {
            ChatLib.chat("§4Failed to upload data");
            ChatLib.chat(err);
        })
        .then(response => {
            ChatLib.chat("§7" + JSON.stringify(response));
        });
}).setName("uploadjacobdata");