document.addEventListener('DOMContentLoaded', function() {
    const calcType = document.getElementById('calcType');
    const distance = document.getElementById('distance');
    const fuel = document.getElementById('fuel');
    const form = document.getElementById('calc-form');
    const resultDiv = document.getElementById('result');
    const preview = document.getElementById('preview-result');
    const analyzeBtn = document.getElementById('analyze-btn');
    const dayListUl = document.getElementById('day-list');
    const resetBtn = document.getElementById('reset-btn');
    
    let dailyCarbon = JSON.parse(localStorage.getItem('carbonData')) || [];

    function updateListUI() {
        dayListUl.innerHTML = '';

        if (dailyCarbon.length === 0) {
            dayListUl.innerHTML = '<li style=" text-align:center;">No days added yet.</li>';
            analyzeBtn.style.display = 'none';
            if(resetBtn) resetBtn.style.display = 'none';
        } else {
            dailyCarbon.forEach((val, index) => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>Day ${index + 1}:</strong> ${val.toFixed(2)} kg CO2`;
                dayListUl.appendChild(li);
            });

            if(resetBtn) resetBtn.style.display = 'inline-block';
            
            if (dailyCarbon.length >= 2) {
                analyzeBtn.style.display = 'inline-block';
            } else {
                analyzeBtn.style.display = 'none';
            }
        }
    }

    updateListUI();

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to delete all daily entries?")) {
                dailyCarbon = [];                
                localStorage.removeItem('carbonData');
                
                updateListUI();
                resultDiv.innerHTML = "";
                preview.innerHTML = "";
            }
        });
    }

    distance.style.display = 'none';
    fuel.style.display = 'none';

    calcType.addEventListener('change', function() {
        const distIn = document.getElementById('jarak');
        const fuelIn = document.getElementById('fuelAmount');
        const fuelType = document.getElementById('efisiensi');
        if (this.value === 'distance') {
            distance.style.display = 'block';
            fuel.style.display = 'none';
            distIn.setAttribute('required', '');
            fuelType.setAttribute('required', '');
            fuelIn.removeAttribute('required');
        } else {
            distance.style.display = 'none';
            fuel.style.display = 'block';
            fuelIn.setAttribute('required', '');
            distIn.removeAttribute('required');
            fuelType.removeAttribute('required');
        }
    });

    async function getCalculation() {
        const type = calcType.value;
        const vehicle = document.getElementById('vehicle').value;

        if (!type || !vehicle) return null;

        let totalKg = 0;

        if (type === 'distance') {
            const dist = parseFloat(document.getElementById('jarak').value || 0);
            
            try {
                const response = await fetch('/predict_emission', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ vehicle: vehicle })
                });
                const data = await response.json();
                
                const factor = data.emission_factor; 
                totalKg = (dist * factor) / 1000;

            } catch (err) {
                console.error(err);
                return null;
            }

        } else {
            const liters = parseFloat(document.getElementById('fuelAmount').value || 0);
            const fuelFactors = {'bensin': 2.31, 'maxGreen': 2.19, 'diesel': 2.6};
            const fType = document.getElementById('efisiensi').value || 'bensin';
            totalKg = liters * (fuelFactors[fType] || 2.31);
        }
        
        return totalKg;
    }

    document.getElementById('calculate-btn').addEventListener('click', async () => {
        preview.innerHTML = "Asking AI...";
        const result = await getCalculation();
        
        if (result !== null) {
            preview.innerHTML = `Carbon Emission: <span style="color:green">${result.toFixed(2)} kg CO2</span>`;
        } else {
            preview.innerHTML = '<span style="color:red">Please input the fields correctly </span>';
        }
    });

    document.getElementById('save-btn').addEventListener('click', async () => {
        const result = await getCalculation();
        
        if (result) {
            dailyCarbon.push(result);
            
            localStorage.setItem('carbonData', JSON.stringify(dailyCarbon));
            updateListUI();
            preview.innerHTML = `Carbon Emission: <span style="color:green">${result.toFixed(2)} kg CO2</span>
            <span>
            Saved</span>`;
        }
    });

    analyzeBtn.addEventListener('click', async () => {
        resultDiv.innerHTML = "<p>Analyzing trend...</p>";
        try{
            const response = await fetch('/analyze_trend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ daily_data: dailyCarbon })
            });

            const data = await response.json();
            if(data.success) {
                let imgHtml = '';
                if (data.plot_image) {
                    imgHtml = `<img src="data:image/png;base64,${data.plot_image}" style="max-width:100%; border-radius:10px; margin-top:15px; box-shadow: 0 2px 4px black">`;
                }
                resultDiv.innerHTML = `
                    <div>
                        <h3>Carbon Emission Trend</h3>
                        <p style="font-size: 1.5em;"><strong>Total Emission:</strong> ${data.total_kg} kg CO2</p>
                        ${imgHtml}
                    </div>
                `;
            } else {
                resultDiv.innerHTML = `<p style="color:red">Error: ${data.message}</p>`;
            }            
        }
        catch (error) {
            console.error(error);
            resultDiv.innerHTML = "<p style='color:red'>Connection Failed.</p>";
        }
    });
});