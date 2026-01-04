const fs = require('fs').promises;
const path = require('path');

const nameIdMap = {
    Cactus: 0,
    Carrot: 1,
    'Cocoa Beans': 2,
    Melon: 3,
    Mushroom: 4,
    'Nether Wart': 5,
    Potato: 6,
    Pumpkin: 7,
    'Sugar Cane': 8,
    Wheat: 9,
    'Wild Rose': 10,
    Sunflower: 11,
    Moonflower: 12,
};

/**
 * @typedef {Object} Contest
 * @property {string} timestamp - The timestamp of the contest
 * @property {number[]} crops - The crops in the contest
 */

/**
 * Check if local contests are still valid (have future contests)
 * @param {Contest[]} contests
 * @returns {boolean}
 */
function hasValidContests(contests) {
    if (!contests || contests.length === 0) return false;

    const now = Date.now();
    const twentyMin = 20 * 60 * 1000; // A contest lasts 20 minutes

    // Check if there's at least one contest that hasn't ended yet
    return contests.some((contest) => contest.timestamp >= now - twentyMin);
}

/**
 *
 * @param {boolean} skyhannyApi - If true, use the Skyhanny API to get contests. If false, use the local JSON file.
 * @return {Promise<Contest[]>} - The contests
 */
async function getContests(skyhannyApi = true) {
    const jsonPath = path.join(__dirname, '../api/jacobcontests.json');

    if (!skyhannyApi) {
        const data = await fs.readFile(jsonPath, 'utf-8');
        return JSON.parse(data);
    }

    try {
        const data = await fs.readFile(jsonPath, 'utf-8');
        const localContests = JSON.parse(data);

        if (hasValidContests(localContests)) {
            return localContests;
        }
    } catch (err) {
        console.log('Local contests file not found or invalid, fetching from API');
    }

    console.log('Fetching contests from Skyhanny API');

    const response = await fetch('https://api.elitebot.dev/contests/at/now');
    const data = await response.json();

    const contests = data.contests;

    const formattedContests = Object.keys(contests).map((timestamp) => ({
        timestamp: parseInt(timestamp) * 1000,
        crops: contests[timestamp].map((crop) => nameIdMap[crop]),
        cropNames: contests[timestamp],
    }));

    try {
        await fs.writeFile(jsonPath, JSON.stringify(formattedContests, null, 2), 'utf-8');
        console.log('Updated local contests file with fresh data');
    } catch (err) {
        console.error('Failed to write contests to local file:', err);
    }

    return formattedContests;
}

module.exports = getContests;
