import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
import joblib
import os

def train_model():
    # Load dataset
    data_path = os.path.join("..", "data", "Loan_Cleaned_Data.csv")
    df = pd.read_csv(data_path)

    # Encode categorical features
    categorical_cols = ['Marital_Status', 'Education', 'Residential_Status']
    encoders = {}

    for col in categorical_cols:
        enc = LabelEncoder()
        df[col] = enc.fit_transform(df[col])
        encoders[col] = enc

    # Features and target
    X = df.drop("Loan_Approval_Status", axis=1)
    y = df["Loan_Approval_Status"]

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Train logistic regression for probability predictions
    model = LogisticRegression(max_iter=1000, solver='liblinear')
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]
    print("Accuracy:", accuracy_score(y_test, y_pred))
    print("ROC AUC Score:", roc_auc_score(y_test, y_proba))
    print("Classification Report:")
    print(classification_report(y_test, y_pred))

    # Save model and encoders
    joblib.dump(model, "loan_approval_probability_model.pkl")
    joblib.dump(encoders, "loan_label_encoders.pkl")

    print("Model and encoders saved.")


def predict_dummy():
    # Load model and encoders
    model = joblib.load("loan_approval_probability_model.pkl")
    encoders = joblib.load("loan_label_encoders.pkl")

    # Dummy input values (replace with user input later)
    input_data = {
        'Age': 32,
        'Marital_Status': 'single',
        'Dependents': 0,
        'Education': 'graduate',
        'Annual_Income': 80000,
        'Total_Existing_Loan_Amount': 20000,
        'Credit_Score': 720,
        'Outstanding_Debt': 5000,
        'Residential_Status': 'own'
    }

    # Encode categorical values
    for col in ['Marital_Status', 'Education', 'Residential_Status']:
        input_data[col] = encoders[col].transform([input_data[col]])[0]

    # Convert to DataFrame
    df_input = pd.DataFrame([input_data])

    # Predict probability
    probability = model.predict_proba(df_input)[0][1]
    print(f"Loan approval probability: {probability:.2f}")


if __name__ == "__main__":
    train_model()
    predict_dummy()

