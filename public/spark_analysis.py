from pyspark.sql import SparkSession
from pyspark.sql.functions import col, sum, countDistinct, avg, to_timestamp, date_format
from pyspark.sql.functions import month, year
from flask import Flask, jsonify
from flask_cors import CORS  
import threading
from pyspark.sql import Window
from pyspark.sql.functions import rank
from pyspark.sql import functions as F

# Initialize Spark
spark = SparkSession.builder \
    .appName("ECommerceAnalytics") \
    .getOrCreate()

# Load and transform data
df = spark.read.csv("E-commerce data.csv", header=True, inferSchema=True)
df = df.select(
    col("Customer ID").alias("customer_id"),
    to_timestamp("Purchase Date").alias("purchase_date"),
    col("Product Category").alias("category"),
    col("Product Price").alias("price"),
    col("Quantity").alias("quantity"),
    col("Total Purchase Amount").alias("total_amount"),
    col("Payment Method").alias("payment_method"),
    col("Age").alias("age"),
    col("Gender").alias("gender"),
    col("Churn").alias("churn")
).withColumn("month", date_format("purchase_date", "yyyy-MM"))

# Initialize Flask with CORS
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/overview')
def get_overview():
    result = df.agg(
        sum("total_amount").alias("totalRevenue"),
        countDistinct("purchase_date").alias("totalOrders"),
        countDistinct("customer_id").alias("newCustomers"),
        avg("total_amount").alias("avgOrderValue")
    ).first().asDict()
    return jsonify(result)

@app.route("/api/sales-trends")
def get_sales_trends():
    result = df.groupBy("month").agg(sum("total_amount").alias("total_sales")).orderBy("month").collect()
    return jsonify([row.asDict() for row in result])

@app.route("/api/top-products")
def get_top_products():
    try:
        result = df.groupBy("category") \
                   .agg(sum("total_amount").alias("total_sales")) \
                   .orderBy(col("total_sales").desc()) \
                   .limit(10) \
                   .collect()
        return jsonify([row.asDict() for row in result])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/customer-acquisition")
def get_customer_acquisition():
    try:
        window_spec = Window.partitionBy("customer_id").orderBy("purchase_date")
        # Get first purchase date for each customer
        first_purchases = df.withColumn(
            "first_purchase",
            F.first("purchase_date").over(Window.partitionBy("customer_id").orderBy("purchase_date"))
        )
        result = first_purchases.groupBy(
            date_format("first_purchase", "yyyy-MM").alias("month")
        ).agg(
            countDistinct("customer_id").alias("new_customers")
        ).orderBy("month").collect()
        
        return jsonify([row.asDict() for row in result])
    except Exception as e:
        return jsonify({
            "error": "Server error",
            "details": str(e)
        }), 500

@app.route("/api/monthly-top-products")
def get_monthly_top_products():
    try:
        # Use ALIASED COLUMN NAMES from initial transformation
        df_month = df.withColumn("month", F.date_format("purchase_date", "yyyy-MM"))
        
        window_spec = Window.partitionBy("month").orderBy(F.col("total_sales").desc())
        
        result = (df_month.groupBy("month", "category")
                 .agg(F.sum("total_amount").alias("total_sales"))
                 .withColumn("rank", F.rank().over(window_spec))
                 .filter(F.col("rank") == 1)
                 .orderBy("month")
                 .collect()
        )
        
        return jsonify([{
            "month": row.month,
            "top_category": row.category,
            "total_sales": float(row.total_sales)
        } for row in result])
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    

@app.route("/api/sales-by-category")
def get_sales_by_category():
    rows = df.groupBy("category").agg(sum("total_amount").alias("total_sales")).collect()
    return jsonify([row.asDict() for row in rows])

def run_flask():
    app.run(port=5001, debug=True, use_reloader=False)  # Added debug mode

if __name__ == "__main__":
    threading.Thread(target=run_flask).start()