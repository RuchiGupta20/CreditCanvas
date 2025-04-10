import pandas as pd

# Load the original dataset
df = pd.read_csv("Loan Dataset.csv")

# -------------------------------------------------------------------------
# Step 1: Check and remove duplicate rows
# -------------------------------------------------------------------------
# Duplicate rows might occur during data collection, merging, or entry errors.
# These rows could bias the model or lead to data leakage if not removed.
# We'll drop them here to ensure each record is unique.

initial_rows = df.shape[0]
df.drop_duplicates(inplace=True)
print(f"Dropped {initial_rows - df.shape[0]} duplicate rows.")

# -------------------------------------------------------------------------
# Step 2: Check for and handle missing values
# -------------------------------------------------------------------------
# Although this dataset currently has no missing values,
# this block ensures robustness in case future versions or other datasets
# have incomplete rows. We'll drop any rows with missing values.

missing_summary = df.isnull().sum()
missing_total = missing_summary.sum()

if missing_total > 0:
    print("Missing values found. Dropping rows with any missing values.")
    df.dropna(inplace=True)
    print(f"Remaining rows after dropping missing values: {df.shape[0]}")
else:
    print("No missing values found. Proceeding to feature selection.")

# -------------------------------------------------------------------------
# Step 3: Select only relevant columns for modeling
# -------------------------------------------------------------------------
# Based on domain knowledge and feature utility, we select columns
# that are most likely to influence loan approval outcomes.

columns_to_keep = [
    'Age',
    'Marital_Status',
    'Dependents',
    'Education',
    'Annual_Income',
    'Total_Existing_Loan_Amount',
    'Credit_Score',
    'Outstanding_Debt',
    'Residential_Status',
    'Loan_Approval_Status'  # This is our target variable
]

df = df[columns_to_keep]

# -------------------------------------------------------------------------
# Step 4: Normalize categorical string fields
# -------------------------------------------------------------------------
# String-based categories are normalized to lowercase to ensure consistency.
# This avoids issues with inconsistent capitalization during model training.

df['Marital_Status'] = df['Marital_Status'].str.lower()
df['Education'] = df['Education'].str.lower()
df['Residential_Status'] = df['Residential_Status'].str.lower()

# -------------------------------------------------------------------------
# Step 5: Save the cleaned dataset
# -------------------------------------------------------------------------
# The cleaned dataset is saved to a new CSV file for future use in modeling.

df.to_csv("Loan_Cleaned_Data.csv", index=False)
print("Preprocessing complete. Cleaned data saved as 'Loan_Cleaned_Data.csv'")
