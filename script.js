const API_KEY = 'd6220d99-7462-44bf-9784-a0d60e1bdcc6'; // Replace with your key
const LAT = -41.183;
const LON = 174.933;

// Fetch tide data from WorldTides API
async function fetchTideData() {
    try {
        const response = await fetch(`https://www.worldtides.info/api/v2?heights&lat=${LAT}&lon=${LON}&length=24&interval=3600&key=${API_KEY}`);
        const data = await response.json();

        if (!data.heights || data.heights.length === 0) {
            throw new Error('No tide data available.');
        }

        const tideData = data.heights.map(item => {
            const date = new Date(item.dt * 1000);
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return { time: `${hours}:${minutes}`, height: item.height };
        });

        displayTable(tideData);
        displayChart(tideData);
    } catch (err) {
        console.error('Error fetching tide data:', err);
        alert('Failed to load tide data. Check console for details.');
    }
}

// Display table below chart
function displayTable(tideData) {
    const tbody = document.querySelector('#tideTable tbody');
    tbody.innerHTML = '';
    tideData.forEach(tide => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${tide.time}</td><td>${tide.height.toFixed(2)}</td>`;
        tbody.appendChild(row);
    });
}

// Display tide chart with current tide marker
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

            // Find nearest time
            let nearestIndex = 0;
            let minDiff = Infinity;
            tideData.forEach((tide, i) => {
                const [h, m] = tide.time.split(':').map(Number);
                const t = h + m / 60;
                const diff = Math.abs(t - currentTime);
                if (diff < minDiff) {
                    minDiff = diff;
                    nearestIndex = i;
                }
            });

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
            responsive: true,
            scales: {
                x: { title: { display: true, text: 'Time' } },
                y: { title: { display: true, text: 'Height (m)' }, beginAtZero: false }
            },
            plugins: { legend: { display: false } }
        },
        plugins: [verticalLinePlugin]
    });
}

// Auto-refresh every hour
fetchTideData();
setInterval(fetchTideData, 3600 * 1000);
