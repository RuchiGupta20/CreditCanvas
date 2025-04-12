
# CreditCanvas – Interactive Credit Data Visualization

## 🚀 How to Run

### Prerequisites

Ensure you have the following Python packages installed:

- flask  
- flask-cors  
- pandas  
- scikit-learn  
- joblib  

Install them via pip:

- pip install flask  
- pip install flask-cors  
- pip install pandas  
- pip install scikit-learn  
- pip install joblib

### Instructions

1. Clone the repository and navigate into the project folder:

>  git clone <your-repo-url>  
>  cd creditcanvas

2. Start the Flask backend:

  cd models  
  python app.py

This will launch the Flask development server on http://localhost:5000 and enable endpoints for prediction and data sampling.

3. Open the frontend:

  Go back to the root directory and locate the index.html file.  
  Use the Live Server extension in VS Code to launch it:  
  Right-click on index.html and choose "Open with Live Server."

## Overview  
CreditCanvas is an interactive web-based tool designed to make credit data more transparent and accessible. By leveraging data visualization, it helps users explore credit trends, loan approval probabilities, and financial disparities across demographics and regions. The project aims to enhance financial literacy and empower users with actionable insights into their credit standing.  

## Features  

### Credit Rating Visualization  
- Interactive Credit Wheel Graph showing credit classification (Poor → Excellent)  
- Credit percentile comparison to show how users rank among their peers  
- Insights into key factors affecting credit scores  

### Loan Approval & Interest Rate Analysis  
- Loan Approval Speedometer predicting approval likelihood via ML  
- Scatter Plot comparing credit score and income of real applicants  
- Interest Rate Comparison Chart (optional/coming soon) showing expected rates  

### Credit Trends by State  
- U.S. state map visualizing credit score, income, and debt-to-income ratio  
- Hover-enabled tooltips displaying FICO, income, and debt data  
- Color-coded gradient scale based on average FICO per state  

## Why CreditCanvas?  

Empowers users to make informed financial decisions  
Simplifies complex credit data through interactive graphs  
Bridges the gap between financial literacy and real-world applications  
Open and accessible alternative to paid credit analysis tools  

## Data Sources  

We use a combination of cleaned public datasets and web-scraped financial sources:

- Average Credit Scores by State – Investopedia: https://www.investopedia.com/average-credit-scores-by-state-5105100  
- Per Capita Income by State (2021) – FRED: https://fred.stlouisfed.org/release/tables?rid=110&eid=257197&od=2021-01-01  
- Loan Approval Dataset – Kaggle: https://www.kaggle.com/datasets/arbaaztamboli/loan-approval-dataset  

Internal cleaned files:
- Combined_State_Financial_Profile.csv  
- Loan_Cleaned_Data.csv  
- Credit_Score_Interest_Model_Data.csv

## Tech Stack  

- Frontend:  
  - HTML, CSS  
  - JavaScript  
  - D3.js for all visualizations  
  - Live Server (VS Code extension)  

- Backend:  
  - Flask (Python)  
  - RESTful APIs with JSON response  

- Machine Learning Models:  
  - Logistic Regression for loan approval prediction  
  - Random Forest Regressor for credit score prediction  

- Data Processing & Training:  
  - Pandas, NumPy, Scikit-learn  
  - Joblib for model serialization  

- Visualization Libraries Used:  
  - D3.js (for map, gauge, scatterplot)  
  - Optionally: Matplotlib/Seaborn (for offline or static visuals during dev)

## Project Milestones  

Milestone 1: Proposal & Dataset Planning  
- Initial visual layout and goals submitted  
- Sources identified and feedback incorporated  
- Decided to narrow scope to three main visuals  

Milestone 2: Dataset Cleaning and Model Training  
- State, loan, and credit score data cleaned  
- Logistic regression and random forest models trained  
- API endpoints created via Flask backend  

Milestone 3: Frontend Integration  
- main.js connects all components interactively  
- US map is fully hoverable and dynamic  
- Loan approval speedometer functional with live prediction  
- Scatterplot generates 30 random points and shows hover tooltips  

Milestone 4: Credit Score Prediction (In Progress)  
- Form and model complete  
- Visualization component under design  
- Data refinement ongoing
- We are actively tracking progress and tasks through GitHub Issues, which are available for review in the repository
