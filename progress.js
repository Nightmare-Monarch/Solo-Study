// Get session data from localStorage
let sessionHistory = JSON.parse(localStorage.getItem("sessionHistory")) || [];
let subjects = JSON.parse(localStorage.getItem("subjects")) || [];

// Prepare daily data
let dailyData = {};

// Go through sessionHistory and calculate hours per day
sessionHistory.forEach(snapshot => {
    let subData = JSON.parse(snapshot);
    let date = new Date().toLocaleDateString();
    let hoursToday = 0;
    subData.forEach(s => {
        hoursToday += s.marks * (15 / 100); // convert marks to hours approx
    });
    if(dailyData[date]) dailyData[date] += hoursToday;
    else dailyData[date] = hoursToday;
});

// Sort dates
let dates = Object.keys(dailyData);
let hours = Object.values(dailyData);

// Create chart
const ctx = document.getElementById('progressChart').getContext('2d');
const progressChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: dates,
        datasets: [{
            label: 'Hours Studied',
            data: hours,
            borderColor: '#00d8ff',
            backgroundColor: 'rgba(0,216,255,0.2)',
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointHoverRadius: 8
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: true, labels: { color: '#00d8ff' } },
            tooltip: { mode: 'index', intersect: false }
        },
        scales: {
            x: { 
                ticks: { color: '#00d8ff' },
                grid: { color: 'rgba(255,255,255,0.1)' }
            },
            y: { 
                beginAtZero: true,
                ticks: { color: '#00d8ff' },
                grid: { color: 'rgba(255,255,255,0.1)' }
            }
        }
    }
});
