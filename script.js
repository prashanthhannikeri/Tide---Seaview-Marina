// Example: Use mock tide data (replace with API later)
const tideData = [
    { time: '00:00', height: 1.2 },
    { time: '02:00', height: 0.8 },
    { time: '04:00', height: 0.5 },
    { time: '06:00', height: 1.0 },
    { time: '08:00', height: 1.5 },
    { time: '10:00', height: 2.0 },
    { time: '12:00', height: 1.8 },
    { time: '14:00', height: 1.3 },
    { time: '16:00', height: 0.9 },
    { time: '18:00', height: 0.6 },
    { time: '20:00', height: 1.1 },
    { time: '22:00', height: 1.4 },
];

// Populate table
const tableBody = document.querySelector('#tideTable tbody');
tideData.forEach(tide => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${tide.time}</td><td>${tide.height}</td>`;
    tableBody.appendChild(row);
});

// Plot Chart
const ctx = document.getElementById('tideChart').getContext('2d');
const tideChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: tideData.map(d => d.time),
        datasets: [{
            label: 'Tide Height (m)',
            data: tideData.map(d => d.height),
            borderColor: '#0077be',
            backgroundColor: 'rgba(0,119,190,0.2)',
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: '#0077be'
        }]
    },
    options: {
        scales: {
            x: { title: { display: true, text: 'Time' } },
            y: { title: { display: true, text: 'Height (m)' }, beginAtZero: false }
        },
        plugins: {
            legend: { display: false }
        }
    }
});
