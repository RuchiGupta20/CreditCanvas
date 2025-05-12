from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os
import numpy as np

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

# Base directory to resolve relative paths
basedir = os.path.dirname(os.path.abspath(__file__))

# Load model and encoders using absolute paths
model = joblib.load(os.path.join(basedir, "loan_approval_probability_model.pkl"))
encoders = joblib.load(os.path.join(basedir, "loan_label_encoders.pkl"))
credit_model = joblib.load(os.path.join(basedir, "credit_prediction_model.pkl"))

@app.route("/credit", methods=["POST"])
def predict_credit():
    data = request.get_json()
    """
    These are the fields that are in request, which are the exact same that the credit score model takes in
    input_data = {
        "Age": 
        "Marital_Status":
        "Dependents":
        "Employment_Status":
        "Residential_Status"
        "Annual_Income": 
        "Monthly_Expenses":
        "Loan_Status":
        "Total_Existing_Loan_Amount":
        "Outstanding_Debt":
        "Bank_Account_History":
        "Existing_Loans": 
    }
    """

    # Convert text choices from frontend into categorial for the model
    input_data = {**data}
    df = pd.DataFrame([input_data])
    df["Marital_Status"]     = df["Marital_Status"].map({"Married": 0, "Single": 1})
    df["Employment_Status"]  = df["Employment_Status"].map({"Employed": 0, "Self-Employed": 1, "Unemployed": 2})
    df["Residential_Status"] = df["Residential_Status"].map({"Own": 0, "Rent": 1, "Other": 2})
    
    cat_cols = [
        "Marital_Status",
        "Employment_Status",
        "Residential_Status",
        "Loan_History",
    ]

    df[cat_cols] = df[cat_cols].astype("category")

    # Fill up any empty cells
    inc_safe  = df["Annual_Income"].replace(0, np.nan)

    # Adding important features
    df["Debt_to_Income_Ratio"] = df["Outstanding_Debt"] / inc_safe
    df["Expense_to_Income_Ratio"] = (df["Monthly_Expenses"] * 12) / inc_safe
    df["Average_Length"] = np.where(df["Existing_Loans"] == 0, 0, df["Bank_Account_History"] / df["Existing_Loans"])
    
    # Removing redundant columns after features developed
    df = df.drop(columns=["Annual_Income", "Monthly_Expenses", "Existing_Loans"])

    # credit-model includes feature extraction and model pipeline, so no need to extract features here
    # Returns a [score] object
    pred = credit_model.predict(df)
    print(pred)

    return jsonify({"score": float(pred[0])})

         
    #"Debt_to_Income_Ratio", "Expense_to_Income_Ratio", "Average_Length"
    #categorical_cols = ["Marital_Status", "Employment_Status", "Residential_Status", "Loan_History"]

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

# Route for scatterplot random sampling
@app.route("/scatter-sample", methods=["GET"])
def scatter_sample():
    try:
        # Path relative to backend folder
        csv_path = os.path.join(basedir, "../data/Loan_Cleaned_Data.csv")
        df = pd.read_csv(csv_path)

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
