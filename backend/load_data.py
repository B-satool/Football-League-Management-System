import pandas as pd
import mysql.connector

# Connect to MySQL
conn = mysql.connector.connect(
    host='localhost', user='root', password='1234', database='dbsproject'
)
cursor = conn.cursor()

# Load CSV
leagues_df = pd.read_csv('leagues.csv')

# Insert rows
for _, row in leagues_df.iterrows():
    cursor.execute("""
        INSERT INTO leagues (league_id, name, country)
        VALUES (%s, %s, %s)
    """, (row['league_id'], row['name'], row['country']))

conn.commit()
cursor.close()
conn.close()
