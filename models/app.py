from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import traceback

app = Flask(__name__)
CORS(app)  # allows frontend running on a different port to connect

# Load model and encoders
model = joblib.load("loan_approval_probability_model.pkl")
encoders = joblib.load("loan_label_encoders.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    # Extract input values
    input_data = {
        'Age': data["Age"],
        'Marital_Status': data["Marital_Status"],
        'Dependents': data["Dependents"],
        'Education': data["Education"],
        'Annual_Income': data["Annual_Income"],
        'Total_Existing_Loan_Amount': data["Total_Existing_Loan_Amount"],
        'Credit_Score': data["Credit_Score"],
        'Outstanding_Debt': data["Outstanding_Debt"],
        'Residential_Status': data["Residential_Status"]
    }

    # Encode categorical features
    for col in ['Marital_Status', 'Education', 'Residential_Status']:
        try:
            input_data[col] = encoders[col].transform([input_data[col]])[0]
        except:
            return jsonify({"error": f"Invalid value for {col}: {input_data[col]}"})

    # Prepare input for prediction
    input_df = pd.DataFrame([input_data])

    # Predict loan approval probability
    probability = model.predict_proba(input_df)[0][1]

    return jsonify({"probability": probability})


# New route for scatterplot random sampling
@app.route("/scatter-sample", methods=["GET"])
def scatter_sample():
    try:
        # Adjust the path if your CSV is located in a different folder
        df = pd.read_csv("../data/Loan_Cleaned_Data.csv")

        # Debug: print the actual column names
        print("Columns:", df.columns.tolist())

        # Select correct columns; replace with actual column names as needed
        sample = df[["Credit_Score", "Annual_Income", "Loan_Approval_Status"]].dropna().sample(30)

        # Return as JSON for the frontend
        return sample.to_json(orient="records")
    except Exception as e:
        print("Error loading scatter data:", e)
        return jsonify({"error": f"Failed to load scatter data: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True)
