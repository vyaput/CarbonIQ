from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io
import base64
from sklearn.linear_model import LinearRegression

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

@app.route("/")
def home():
    return render_template("HomePage.html")

@app.route("/calculator_page")
def calculator_page():
    return render_template("Calculator.html")

@app.route("/chat")
def chat_page():
    return render_template("Chat.html")

@app.route("/profile")
def profile():
    return render_template("profile.html")

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/signup")
def signup():
    return render_template("signup.html")

@app.route("/predict_emission", methods=["POST"])
def predict_emission():
    data = request.json
    vehicle = data.get('vehicle', 'family')

    print("DATA RECEIVED FROM FRONTEND:", data)

    cc_input = map_kendaraan_cc.get(vehicle, 1500)

    if model:
        emission_factor = model.predict([[cc_input]])[0]
    else:
        emission_factor = 150
        
    return jsonify({
        "success": True, 
        "emission_factor": float(emission_factor)
    })

@app.route("/analyze_trend", methods=["POST"])
def analyze_trend():
    data = request.json
    emissions_list = data.get('daily_data', [])

    if not emissions_list or len(emissions_list) < 2:
        return jsonify({"success": False, "message": "Need at least 2 days."})

    # Prepare Data: X = Days, Y = Emissions
    day_count = len(emissions_list)
    days = np.array(range(1, len(emissions_list) + 1)).reshape(-1, 1)
    emissions = np.array(emissions_list).reshape(-1, 1)

    # Train temporary model for Trend
    trend_model = LinearRegression()
    trend_model.fit(days, emissions)
    trend_line = trend_model.predict(days)

    future_days = np.array(range(day_count, day_count + 6)).reshape(-1, 1)
    future_forecast = trend_model.predict(future_days)
    
    # Generate Plot
    plt.clf()
    plt.figure(figsize=(10, 6))
    plt.plot(days, trend_line, color='blue', linewidth=3, label='Trend Line')
    plt.scatter(days, emissions, color='red', s=100, zorder=5, label='Actual Data')
    plt.plot(future_days, future_forecast, color='blue', linestyle='--', linewidth=3, label='7-Day Forecast')
    plt.xlabel('Day')
    plt.ylabel('Emission (kg)')
    plt.title('Daily Emission Trend')
    plt.legend()
    plt.grid(True, alpha=0.3)

    img = io.BytesIO()
    plt.savefig(img, format='png', bbox_inches='tight')
    img.seek(0)
    plot_url = base64.b64encode(img.getvalue()).decode()

    return jsonify({
        "success": True,
        "total_kg": round(sum(emissions_list), 2),
        "plot_image": plot_url
    })

if __name__ == '__main__':
    app.run(debug=True)