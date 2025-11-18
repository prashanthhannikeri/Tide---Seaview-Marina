const API_KEY = 'd6220d99-7462-44bf-9784-a0d60e1bdcc6'; // Replace with your WorldTides API key
const LAT = -41.183; // Seaview Marina latitude
const LON = 174.933; // Seaview Marina longitude

async function fetchTideData() {
    try {
        const response = await fetch(`https://www.worldtides.info/api/v2?heights&lat=${LAT}&lon=${LON}&length=24&key=${API_KEY}`);
        const data = await response.json();

        if (!data.heights) {
            throw new Error('No tide data available.');
        }

        // Map API response to tideData array
        const tideData = data.heights.map(item => {
            const date = new Date(item.dt * 1000);
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return {
                time: `${hours}:${minutes}`,
                height: item.height
            };
        });

        displayTable(tideData);
        displayChart(tideData);
    } catch (error) {
        console.error('Error fetching tide data:', error);
    }
}

function displayTable(tideData) {
    const tableBody = document.querySelector('#tideTable tbody');
    tableBody.innerHTML = '';
    tideData.forEach(tide => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${tide.time}</td><td>${tide.height.toFixed(2)}</td>`;
        tableBody.appendChild(row);
    });
}

function displayChart(tideData) {
    const ctx = document.getElementById('tideChart').getContext('2d');

    const now = new Date();
    const currentTime = now.getHours() + now.getMinutes() / 60;

    const verticalLinePlugin = {
        id: 'verticalLine',
        afterDraw: (chart) => {
            const xScale = chart.scales.x;
            const yScale = chart.scales.y;
            const ctx = chart.ctx;

            const nearestIndex = tideData.reduce((prev, curr, i) => {
                const timeParts = curr.time.split(':');
                const timeValue = parseInt(timeParts[0]) + parseInt(timeParts[1]) / 60;
                return Math.abs(timeValue - currentTime) < Math.abs(prev.diff) ? {index: i, diff: timeValue - currentTime} : prev;
            }, {index: 0, diff: 1000}).index;

            const xPos = xScale.getPixelForValue(nearestIndex);

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(xPos, yScale.top);
            ctx.lineTo(xPos, yScale.bottom);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'red';
            ctx.stroke();
            ctx.restore();
        }
    };

    new Chart(ctx, {
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
        },
        plugins: [verticalLinePlugin]
    });
}

// Load data on page load
fetchTideData();
