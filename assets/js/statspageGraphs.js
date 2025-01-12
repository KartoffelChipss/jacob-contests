const datesArray = visitsThisMonth.map(entry => new Date(entry.date));
const visitsArray = visitsThisMonth.map(entry => entry.totalVisits);

console.log("visitsThisMonth: ", visitsThisMonth)

console.log("VisitsArray", visitsArray)

const monthlyChartCanvas = document.getElementById("monthlyChart");
const monthlyCtx = monthlyChartCanvas.getContext("2d");

var monthGradient = monthlyCtx.createLinearGradient(0, 0, 0, monthlyCtx.canvas.clientHeight);
monthGradient.addColorStop(0, 'rgba(205,177,89,0.3)');
monthGradient.addColorStop(1, 'rgba(205,177,89,0.008)');

console.log("Month height: " + monthlyCtx.canvas.clientHeight)

const monthlyChartConfig = {
    type: 'line',
    data: {
        labels: datesArray,
        datasets: [{
            label: "Visits",
            fill: true,
            backgroundColor: monthGradient,
            borderColor: "#cdb159",
            data: visitsArray,
            lineTension: 0.3,
            borderWidth: 4,
            pointRadius: 0,
            pointHoverRadius: 4
        }]
    },
    options: {
        responsive: true,
        plugins: {
            title: {
                display: false,
                text: 'Chart'
            },
            legend: {
                display: false,
            },
        },
        interaction: {
            intersect: false,
        },
        tooltips: {
            mode: 'index',
            intersect: false
        },
        hover: {
            mode: 'index',
            intersect: false
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Day'
                },
                grid: {
                    color: "hsl(0, 0%, 20%)"
                },
                type: 'time',
                time: {
                    unit: 'day'
                },
                ticks: {
                    beginAtZero: true
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Visits'
                },
                grid: {
                    color: "hsl(0, 0%, 20%)"
                },
                ticks: {
                    beginAtZero: false,
                    callback: function (value, index, values) {
                        return value.toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 1, minimumFractionDigits: 1 });
                    }
                },
                // suggestedMin: -10,
                // suggestedMax: 200
            }
        }
    },
};

const monthlyChart = new Chart("monthlyChart", monthlyChartConfig);