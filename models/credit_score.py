from pathlib import Path
import numpy as np
import pandas as pd
import os

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.metrics import (
    mean_absolute_error,
    classification_report,
    accuracy_score,
    f1_score,
)
from xgboost import XGBRegressor
from sklearn.pipeline import Pipeline
import pickle

RAW_CSV = os.path.join("..", "data", "data_processing", "credit_data", "Loan Dataset.csv")
CLEANED_CSV = os.path.join("..", "data", "data_processing", "credit_data", "Cleaned_Credit_Data.csv")

def preprocess_data(path: str = RAW_CSV) -> pd.DataFrame:

    df = pd.read_csv(path)

    # Unnecessary columns for credit score predictions (including all loan columns except Loan_History, location, ID), or would add bias to the model (ex: gender, education) 

    drop_cols = [
        "Applicant_ID", "Loan_Amount_Requested", "Loan_Term", "Loan_Purpose",
        "Interest_Rate", "Loan_Type", "Co-Applicant", "Loan_Approval_Status",
        "Default_Risk", "Gender", "Education", "Occupation_Type", "City/Town", "Transaction_Frequency"
    ]
    df = df.drop(columns=drop_cols)

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

    inc_safe  = df["Annual_Income"].replace(0, np.nan)

    # Adding important features
    df["Debt_to_Income_Ratio"] = df["Outstanding_Debt"] / inc_safe
    df["Expense_to_Income_Ratio"] = (df["Monthly_Expenses"] * 12) / inc_safe
    df["Average_Length"] = np.where(df["Existing_Loans"] == 0, 0, df["Bank_Account_History"] / df["Existing_Loans"])
    
    # Removing redundant columns after features developed
    df = df.drop(columns=["Annual_Income", "Monthly_Expenses", "Existing_Loans"])

    # fill any NaNs created by zero-income or zero-loan cases
    df = df.fillna(0)

    df.to_csv(CLEANED_CSV, index=False, columns = df.columns)

    return df


def train_xgb_regressor(df: pd.DataFrame) -> None:
    # Use the original numeric credit score as the regression target
    y = df["Credit_Score"].astype(int)
    X = df.drop(columns=["Credit_Score"])

    # 80/20 train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, stratify=y, test_size=0.20, random_state=42
    )

    # Removing 10% of train for early-stopping validation
    X_tr, X_val, y_tr, y_val = train_test_split(
        X_train, y_train, stratify=y_train, test_size=0.10, random_state=42
    )

    numeric_cols = ["Age", "Dependents", "Total_Existing_Loan_Amount", "Outstanding_Debt", "Bank_Account_History", "Debt_to_Income_Ratio", "Expense_to_Income_Ratio", "Average_Length"]
    categorical_cols = ["Marital_Status", "Employment_Status", "Residential_Status", "Loan_History"]

    # Preprocessing pipeline
    preprocess = ColumnTransformer(
        [
            ("num", StandardScaler(), numeric_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols),
        ],
        remainder="drop",
    )

    X_tr_tf  = preprocess.fit_transform(X_tr)
    X_val_tf = preprocess.transform(X_val)
    X_test_tf = preprocess.transform(X_test)

    # Instantiate and train XGBRegressor with early stopping
    reg = XGBRegressor(
        objective="reg:squarederror",
        n_estimators=1500,
        learning_rate=0.05,
        max_depth=5,
        subsample=0.85,
        colsample_bytree=0.8,
        tree_method="hist",   
        random_state=42,
        n_jobs=-1,
        eval_metric="mae",
        early_stopping_rounds=50,
    )

    # Pipeline that is used for simplifying API implementation - any feature extraction of request data can be done here instead of coded again in the API

    pipe = Pipeline([("prep", preprocess), ("reg", reg)])
    pipe.fit(X_train, y_train,
         reg__eval_set=[(X_val_tf, y_val)], reg__verbose=False)
    


    # -----------------
    # FOR TESTING
    # -----------------

    # predict continuous scores on test set
    y_pred_cont = pipe.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred_cont)
    print(f"Numeric MAE on 300–850 score: {mae:.2f}")

    # now bin both true & predicted scores into 5 ordinal classes
    bins   = [-np.inf, 579, 669, 739, 799, np.inf]
    labels = [0, 1, 2, 3, 4]  # 0=Poor/Fair, 1=Good, 2=Very Good, 3=Excellent

    y_test_cls = pd.cut(y_test, bins=bins, labels=labels).astype(int)
    y_pred_cls = pd.cut(y_pred_cont, bins=bins, labels=labels).astype(int)

    print("\nBinned classification results")
    print("-----------------------------")
    print(f"Accuracy : {accuracy_score(y_test_cls, y_pred_cls):.4f}")
    print(f"Macro-F1 : {f1_score(y_test_cls, y_pred_cls, average='macro'):.4f}\n")
    print(classification_report(y_test_cls, y_pred_cls))

    # Store the model so it can be used for making predictions

    with open("credit_prediction_model.pkl", "wb") as model_file:
        pickle.dump(pipe, model_file)


if __name__ == "__main__":
    df = preprocess_data()
    train_xgb_regressor(df)
