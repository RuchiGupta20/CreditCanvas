
import pandas as pd

# Load datasets
fico_debt_df = pd.read_csv("State_FICO_and_Credit_Card_Debt.csv")
income_df = pd.read_csv("State_Income_2021.csv")

# Rename columns for clarity and consistency
fico_debt_df.columns = ['State', 'Avg FICO Score', 'Avg Credit Card Debt']
income_df = income_df.rename(columns={'Name': 'State', '2021': 'Avg Income 2021'})

# Merge datasets on 'State' column
merged_df = pd.merge(fico_debt_df, income_df[['State', 'Avg Income 2021']], on='State', how='inner')

# Calculate Credit Card Debt to Income Ratio
merged_df['Credit Card Debt to Income Ratio'] = merged_df['Avg Credit Card Debt'] / merged_df['Avg Income 2021']

# Round numerical values for better readability
merged_df['Avg Credit Card Debt'] = merged_df['Avg Credit Card Debt'].round(2)
merged_df['Avg Income 2021'] = merged_df['Avg Income 2021'].round(2)
merged_df['Credit Card Debt to Income Ratio'] = merged_df['Credit Card Debt to Income Ratio'].round(4)

# Reorder columns to desired output
final_df = merged_df[['State', 'Avg FICO Score', 'Avg Credit Card Debt', 'Avg Income 2021', 'Credit Card Debt to Income Ratio']]

# Save to new CSV
final_df.to_csv("Combined_State_Financial_Profile.csv", index=False)

print("Data processing complete. Output saved to 'Combined_State_Financial_Profile.csv'")
