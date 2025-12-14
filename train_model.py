import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib

data = {
    'estimasi_cc': [
        110, 250, 1200, 1500, 2500, 1500, 4000, 6000, 8000, 10000, 12000
    ],
    'emisi_co2_perkm': [
        40, 80, 120, 150, 200, 160, 300, 500, 600, 800, 900,
    ]
}

df = pd.DataFrame(data)

X = df[['estimasi_cc']]
y = df[['emisi_co2_perkm']]

model = LinearRegression()
model.fit(X, y)

joblib.dump(model, 'model_emisi.pkl')

print("Model trained!")
print(f"Coefficient (Slope): {model.coef_[0]}")
print(f"Intercept: {model.intercept_}")