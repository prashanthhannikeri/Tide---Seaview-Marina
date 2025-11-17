let tideChart;

async function fetchTideData() {
    try {
        // Fetch CSV from GitHub
        const response = await fetch('seaview-tide.csv');
        const csvText = await response.text();

        // Parse CSV
        const data = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        const tideData = data.data.map(item => {
            return {
                time: item.Time,              // Make sure CSV column name matches
                height: parseFloat(item.Height)
            };
        });

        displayTable(tideData);
        displayChart(tideData);

        // Refresh every hour (optional)
        setTimeout(fetchTideData, 3600000);

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

    const verticalLinePlugin = {
        id: 'verticalLine',
        afterDraw: (chart) => {
            const xScale = chart.scales.x;
            const yScale = chart.scales.y;
            const ctx = chart.ctx;

            const now = new Date();
            const currentTime = now.getHours() + now.getMinutes() / 60;

            const nearestIndex = tideData.reduce((prev, curr, i) => {
                const [h, m] = curr.time.split(':').map(Number);
                const timeValue = h + m / 60;
                return Math.abs(timeValue - currentTime) < Math.abs(prev.diff) ? {index: i, diff: timeValue - currentTime} : prev;
            }, {index: 0, diff: 1000}).index;

            const xPos = xScale.getPixelForValue(nearestIndex);
            const yPos = yScale.getPixelForValue(tideData[nearestIndex].height);

            // Vertical line
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(xPos, yScale.top);
            ctx.lineTo(xPos, yScale.bottom);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'red';
            ctx.stroke();

            // Circle marker at current tide
            ctx.beginPath();
            ctx.arc(xPos, yPos, 6, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
            ctx.restore();
        }
    };

    if (tideChart) tideChart.destroy();

    tideChart = new Chart(ctx, {
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
                pointRadius: 3,
                pointBackgroundColor: '#0077be'
            }]
        },
        options: {
            animation: false,
            scales: {
                x: { title: { display: true, text: 'Time' } },
                y: { title: { display: true, text: 'Height (m)' }, beginAtZero: false }
            },
            plugins: { legend: { display: false } }
        },
        plugins: [verticalLinePlugin]
    });
}

// Load data on page load
fetchTideData();
