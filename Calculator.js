document.addEventListener('DOMContentLoaded', function() {
    const calcTypeSelect = document.getElementById('calcType');
    const distance = document.getElementById('distance');
    const fuel = document.getElementById('fuel');
    const form = document.getElementById('calc-form');
    
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

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const calcType = document.getElementById('calcType').value;
        const vehicle = document.getElementById('vehicle').value;
        const jarak = document.getElementById('jarak').value;
        const efisiensi = document.getElementById('efisiensi').value;
        const fuelAmount = document.getElementById('fuelAmount').value;
        
        // Add your calculation logic here
    });
});