from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io
import base64

app = Flask (__name__, static_folder='static', template_folder='templates')
CORS(app)

try:
    model = joblib.load('model_emisi.pkl')
except:
    print("WARNING: There's no model. Run train_model.py first!")
    model = None

map_kendaraan_cc = {
    'bebek': 110, 'sport': 250, 'lcgc': 1200, 'family': 1500, 'suv': 2500, 'pickup': 1500, 'light': 4000, 'medium': 6000, 'large': 10000, 'tour': 12000, 'city': 8000
}

map_bbm_emisi = {
    'bensin': 2310, 'green': 2100, 'diesel': 2600
}

@app.route("/")
def home():
    return render_template("HomePage.html")

@app.route("/calculator_page")
def calculator_page():
    return render_template("Calculator.html")

@app.route("/calculate", methods=["POST"])
def calculate():
    data = request.json

    print("DATA RECEIVED FROM FRONTEND:", data)

    tipe_hitung = data.get('calcType')
    kendaraan = data.get('vehicle')
    bbm = data.get('efisiensi')

    total_emisi = 0
    pesan = ""
    plot_url = None

    cc_input = map_kendaraan_cc.get(kendaraan, 1500)

    if model:
        prediksi_perkm = model.predict([[cc_input]])[0]
    else:
        prediksi_perkm = 0

    if tipe_hitung == 'distance':
        jarak = float(data.get('jarak', 0))
        total_emisi = prediksi_perkm * jarak
        pesan = f"Estimated emission for travelling {jarak} km using {kendaraan}."

    elif tipe_hitung == 'fuelUsed':
        liter = float(data.get('fuelAmount', 0))
        faktor_bbm = 2310

        if bbm == 'green':
            faktor_bbm = 2100
        elif bbm == 'diesel':
            faktor_bbm = 2600

        total_emisi = liter * faktor_bbm
        pesan = f"Estimated emission from burning {liter} liter of fuel."
    
    plt.clf()

    x_range = np.array([[100], [12000]])
    y_range = model.predict(x_range)
    plt.plot (x_range, y_range, color='blue', linewidth = 2, label = 'Regression Line')

    plt.scatter([[cc_input]], [[prediksi_perkm]], color = 'red', s = 100, label = 'Your vehicle', zorder = 5)

    plt.xlabel('Engine Size (CC)')
    plt.ylabel('Emision (g/km)')
    plt.title(f'Emission Position {kendaraan.upper()}')
    plt.legend()
    plt.grid(True, alpha = 0.3)

    img = io.BytesIO()
    plt.savefig(img, format = 'png', bbox_inches = 'tight')
    img.seek(0)

    plot_url = base64.b64encode(img.getvalue()).decode()

    return jsonify({
        "success": True,
        "total_emisi_gram": round(total_emisi, 2),
        "total_emisi_kg": round(total_emisi / 1000, 2),
        "message": pesan,
        "plot_image": plot_url
    })

if __name__ == '__main__':
    app.run(debug=True)