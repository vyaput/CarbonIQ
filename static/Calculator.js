document.addEventListener('DOMContentLoaded', function() {
    const calcTypeSelect = document.getElementById('calcType');
    const distance = document.getElementById('distance');
    const fuel = document.getElementById('fuel');
    const form = document.getElementById('calc-form');
    const resultDiv = document.getElementById('result')
    
    distance.style.display = 'none';
    fuel.style.display = 'none';

    calcTypeSelect.addEventListener('change', function() {
        if (this.value === 'distance') {
            distance.style.display = 'block';
            fuel.style.display = 'none';
        } else {
            distance.style.display = 'none';
            fuel.style.display = 'block';
        }
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const calcType = document.getElementById('calcType').value;
        const vehicle = document.getElementById('vehicle').value;
        const jarak = document.getElementById('jarak').value;
        const efisiensi = document.getElementById('efisiensi').value;
        const fuelAmount = document.getElementById('fuelAmount').value;

        const dataPaket = {
            calcType: calcType,
            vehicle: vehicle,
            efisiensi: efisiensi,
            jarak: jarak ? parseFloat(jarak) : 0,
            fuelAmount: fuelAmount ? parseFloat(fuelAmount) : 0
        }

        console.log("Sending data to Python...", dataPaket);

        resultDiv.innerHTML = "<p>Calculating ...</p>";

        try {
            const response = await fetch('/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataPaket)
            });

            const hasil = await response.json();

            if (hasil.success) {

                let gambarHtml = '';
                if (hasil.plot_image) {
                    gambarHtml = `<img src="data:image/png;base64,${hasil.plot_image}" style="max-width:100%; height:auto; margin-top:15px; border-radius:8px;">`;
                }

                resultDiv.innerHTML = `<div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin-top: 10px;">
                        <h3>Total Emisi: ${hasil.total_emisi_kg} kg CO2</h3>
                        <p>${hasil.message}</p>

                        ${gambarHtml}
                    </div>`
            } else {
                resultDiv.innerHTML = "<p style = 'color:red'> Error: " + hasil.message + "</p>";
            }
        } catch (error) {
            console.error ('Error:', error);
            resultDiv.innerHTML = "<p style = 'color:red'> Failed to connect to Python server.</p>"
        }
        
        // Add your calculation logic here
    });
});