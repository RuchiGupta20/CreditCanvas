
# CreditCanvas – Interactive Credit Data Visualization

## 🔗 Project Materials

- 🎥 [Project Screencast (YouTube)](https://youtu.be/nzO-AhdWWwM)
- 📘 [Final Process Book (PDF)](docs/Final%20Process%20Book.pdf)

---

## 🚀 How to Run

### Prerequisites

Ensure you have the following Python packages installed:

- flask  
- flask-cors  
- pandas  
- scikit-learn  
- joblib  
- numpy (if using Python 3.12+, requires numpy >= 1.26)

We also provide a `requirements.txt` file for convenience:

```bash
pip install -r requirements.txt

### Instructions

1. Clone the repository and navigate into the project folder:

`git clone https://github.com/RuchiGupta20/CreditCanvas.git`  
`cd creditcanvas`

2. Start the Flask backend:

`cd models`  
`python app.py`

This will launch the Flask development server on http://localhost:5000 and enable endpoints for prediction and data sampling.

3. Open the frontend:

  - Go back to the root directory and locate the index.html file.  
  - Use the Live Server extension in VS Code to launch it:  
  - Right-click on index.html and choose "Open with Live Server."

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

Milestone 4: Completion 
- We actively tracked progress and tasks through GitHub Issues, which are available for review in the repository
- Project Milestone Processbook can be found in the repo as a pdf, or at this link: https://docs.google.com/document/d/1ER4Kyb33fVkRLMbZDx2TP_sRa8pQYGN85nD6K9RolLg/edit?tab=t.0


## Visualizations and Interface Features

CreditCanvas features three core interactive visualizations:

### 1. U.S. State Financial Map
This choropleth map uses a color gradient based on average FICO scores to visually compare state-level financial data. 

**Features:**
- Hover over any state to reveal a tooltip with:
  - Average FICO score  
  - Average income  
  - Average credit card debt  
  - Debt-to-income ratio  
- Dynamic gradient coloring to distinguish low vs. high credit scores.

### 2. Loan Approval Speedometer
A semicircular gauge displays the predicted loan approval probability after the user submits their financial profile via the form.

**Features:**
- Each range (Poor, Fair, Good, Excellent) is color-coded.
- Hovering over segments reveals suggestions to improve loan chances.
- After submission, the pointer animates to show the predicted approval percentage.

### 3. Scatterplot: Credit Score vs. Income
This scatterplot shows a sample of real loan applicants with their credit scores and annual incomes, along with whether they were approved or rejected.

**Features:**
- Points are color-coded (green for approved, red for rejected).
- Hovering over a point displays a tooltip with:
  - Credit score  
  - Annual income  
  - Loan approval status  
- Button generates a new random sample of 30 applicants each time.

## Code and Library Overview

This repository includes both original code written by our team and open-source libraries that support data visualization and machine learning. Below is a breakdown of which parts were developed by us and which rely on third-party tools.

### Our Code

- **Frontend (HTML, CSS, JS)**
  - `index.html`: Full website structure and embedded interface
  - `main.js`: All D3-based visualizations including:
    - U.S. financial map (interactive choropleth)
    - Speedometer-style loan approval gauge
    - Scatterplot for credit score vs. income
    - Tooltip interactivity and form logic

- **Backend (Flask)**
  - `app.py`: API endpoints:
    - `/predict`: Predicts loan approval probability using logistic regression
    - `/scatter-sample`: Serves random samples for the scatterplot
  - `train_model.py`: Trains the model and saves it via `joblib`
  - `loan_approval_probability_model.pkl`, `loan_label_encoders.pkl`: Serialized ML model and label encoders

- **Data Handling & Modeling**
  - Custom preprocessing, label encoding, and model training using our cleaned datasets (`Loan_Cleaned_Data.csv`, etc.)

### External Libraries

- **Frontend**
  - [`D3.js`](https://d3js.org/): Interactive SVG-based charts
  - [`TopoJSON`](https://github.com/topojson/topojson): Rendering state boundaries

- **Backend**
  - `Flask`, `Flask-CORS`: Server and API handling
  - `pandas`, `numpy`: Data processing
  - `scikit-learn`: ML models and encoders
  - `joblib`: Model serialization

---

For a detailed explanation of each directory, file, and implementation rationale, please refer to our:

**Final Process Book**: [CreditCanvas Final Process Book (PDF)](./Final%Process%20Book.pdf)
