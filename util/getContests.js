const nameIdMap = {
    "Cactus": 0,
    "Carrot": 1,
    "Cocoa Beans": 2,
    "Melon": 3,
    "Mushroom": 4,
    "Nether Wart": 5,
    "Potato": 6,
    "Pumpkin": 7,
    "Sugar Cane": 8,
    "Wheat": 9
}

/**
 * @typedef {Object} Contest
 * @property {string} timestamp - The timestamp of the contest
 * @property {number[]} crops - The crops in the contest
 */

/**
 *
 * @param {boolean} skyhannyApi - If true, use the Skyhanny API to get contests. If false, use the local JSON file.
 * @return {Promise<Contest[]>} - The contests
 */
async function getContests(skyhannyApi = true) {
    if (!skyhannyApi) return require("../api/jacobcontests.json");

    console.log("Fetching contests from Skyhanny API");

    const response = await fetch("https://api.elitebot.dev/contests/at/now");
    const data = await response.json();

    const contests = data.contests;

    const formattedContests = Object.keys(contests).map(timestamp => ({
        timestamp: parseInt(timestamp) * 1000,
        crops: contests[timestamp].map(crop => nameIdMap[crop])
    }));

    return formattedContests;
}

module.exports = getContests;