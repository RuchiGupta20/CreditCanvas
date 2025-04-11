import pandas as pd
import numpy as np
from sklearn.cluster import KMeans


def preprocess_data():
    df = pd.read_csv("Loan Dataset.csv")

    """

    Removing columns that don't relate to credit approval
    These are 
    - Applicant_ID
    - Loan_Amount_Requested
    - Loan_Term
    - Loan_Purpose
    - Interest_Rate
    - Loan_Type
    - Co-Applicant
    - Loan_Approval_Status
    - Transaction_Frequency
    - Default_Risk

    Also removing columns that would cause an inherent bias in the model if included
    These are:
    - Gender
    - Education
    - Occupation_Type
    - City/Town


    """
    new_df = df.drop(columns=["Applicant_ID", "Loan_Amount_Requested", "Loan_Term", "Loan_Purpose", "Interest_Rate", "Loan_Type", "Co-Applicant", "Loan_Approval_Status", "Default_Risk"])
    final_df = new_df.drop(columns=["Gender", "Education", "Occupation_Type", "City/Town"])

    return final_df

# Rough draft of credit approval model
def train_kmeans_model(df):
    
    # Convert all data to numerical data
    for idx, row in df.iterrows():
        # Marital_Status
        df.loc[idx, "Marital_Status"] = 0 if row["Marital_Status"] == "Married" else 1
        # Employment_Status
        df.loc[idx, "Employment_Status"] = 0 if row["Employment_Status"] == "Employed" else 1 if row["Employment_Status"] == "Self-Employed" else 2
        # Residential_status
        df.loc[idx, "Residential_Status"] = 0 if row["Residential_Status"] == "Own" else 1 if row["Residential_Status"] == "Rent" else 2
    
    print(df.head())
    print(df["Credit_Score"].head())
    # Drop credit score label (using k-means to depict groups)
    df = df.drop(columns=["Credit_Score"])

    # Write final data to output spreadsheet
    df.to_csv("Cleaned_Loan_Data.csv", index=False)
    
    data = df.to_numpy()

    # K means clustering with 5 clusters
    # The five clusters represent the 5 categories of credit (Poor, Fair, Good, Very Good, Excellent)
    # Each cluster is associated with a category of credit
    # Since we are trying to understand the grouping of customers without knowing their credit, we need to use an unsupervised model like k-means clustering

    model = KMeans(5)
    model.fit(data)

    labels = model.labels_
    print("Cluster labels:", labels)

    centroids = model.cluster_centers_
    print("Cluster centroids:", centroids)

    # Making an example prediction, puts a data point in one of the five clusters
    test_point = np.array([df.iloc[0].to_numpy(), df.iloc[1].to_numpy()])
    predictions = model.predict(test_point)
    print("Predictions:", predictions )
    


if __name__ == "__main__":
    d = preprocess_data()
    train_kmeans_model(d)