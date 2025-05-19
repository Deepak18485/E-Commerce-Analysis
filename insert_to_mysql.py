import pandas as pd
import pymysql

# Load and clean the data
df = pd.read_csv("Transaction.csv")

# Clean data
df['TransactionNo'] = df['TransactionNo'].astype(str)
df['ProductNo'] = df['ProductNo'].astype(str)
df['CustomerNo'] = df['CustomerNo'].fillna(0).astype(int).astype(str)
df['Date'] = pd.to_datetime(df['Date'], format='%m/%d/%Y').dt.strftime('%Y-%m-%d')

# Connect to MySQL
connection = pymysql.connect(
    host='localhost',
    user='root',
    password='Ecommerce@1',
    database='ecommerce_db',
   autocommit=True
)

cursor = connection.cursor()

# Create table
# cursor.execute("""
# CREATE TABLE IF NOT EXISTS transactions (
#     transaction_id VARCHAR(20),
#     transaction_date DATE,
#     product_id VARCHAR(20),
#     product_name TEXT,
#     price DECIMAL(10, 2),
#     quantity INT,
#     customer_id VARCHAR(20),
#     country VARCHAR(100)
# )
# """)

# Insert data
for _, row in df.iterrows():
    cursor.execute("""
        INSERT INTO transactions (
            transaction_id, transaction_date, product_id,
            product_name, price, quantity, customer_id, country
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        row['TransactionNo'], row['Date'], row['ProductNo'],
        row['ProductName'], row['Price'], row['Quantity'],
        row['CustomerNo'], row['Country']
    ))

cursor.close()
connection.close()
print("✅ Data inserted successfully into MySQL.")
