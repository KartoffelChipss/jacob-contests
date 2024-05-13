const viewsModel = require("../models/viewsmodel");

// Function to get total visits for a specific date range
async function getTotalVisits(startDate, endDate, route = "/") {
    const visits = await viewsModel.aggregate([
        {
            $match: {
                route,
                date: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: null,
                totalVisits: { $sum: "$count" }
            }
        }
    ]);

    return visits.length > 0 ? visits[0].totalVisits : 0;
}

// Function to get total visits for this year
async function getTotalVisitsThisYear() {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
    return getTotalVisits(startOfYear, endOfYear);
}

// Function to get total visits for last year
async function getTotalVisitsLastYear() {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear() - 1, 0, 1);
    const endOfYear = new Date(today.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
    return getTotalVisits(startOfYear, endOfYear);
}

// Function to get total visits for this month
async function getTotalVisitsThisMonth() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    return getTotalVisits(startOfMonth, endOfMonth);
}

// Function to get total visits for last month
async function getTotalVisitsLastMonth() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
    return getTotalVisits(startOfMonth, endOfMonth);
}

// Function to get total visits for today
async function getTotalVisitsToday() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    return getTotalVisits(startOfDay, endOfDay);
}

// Function to get total visits for yesterday
async function getTotalVisitsYesterday() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const startOfDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const endOfDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
    return getTotalVisits(startOfDay, endOfDay);
}

// Function to get an array of visits per day for the last 30 days
async function getVisitsLast30Days() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 29);

    const visits = await viewsModel.aggregate([
        {
            $match: {
                date: {
                    $gte: thirtyDaysAgo,
                    $lte: today
                }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                totalVisits: { $sum: "$count" }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);

    // Fill in missing dates with 0 visits
    const visitsMap = new Map(visits.map(({ _id, totalVisits }) => [_id, totalVisits]));
    const result = [];
    for (let i = new Date(thirtyDaysAgo); i <= today; i.setDate(i.getDate() + 1)) {
        const formattedDate = i.toISOString().split('T')[0];
        const totalVisits = visitsMap.get(formattedDate) || 0;
        result.push({ date: formattedDate, totalVisits });
    }

    return result;
}

module.exports = {
    getTotalVisits,
    getTotalVisitsLastMonth,
    getTotalVisitsLastYear,
    getTotalVisitsThisMonth,
    getTotalVisitsThisYear,
    getTotalVisitsToday,
    getTotalVisitsYesterday,
    getVisitsLast30Days,
}