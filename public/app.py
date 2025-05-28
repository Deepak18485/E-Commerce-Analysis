# from flask import Flask, jsonify
# from pyspark.sql import SparkSession
# from pyspark.sql.functions import col, sum, countDistinct, avg, to_timestamp, date_format

# app = Flask(__name__)

# # Spark Session
# spark = SparkSession.builder.appName("ECommerceAnalytics").getOrCreate()

# # Load data
# df = spark.read.csv("E-commerce data.csv", header=True, inferSchema=True)
# df = df.select(
#     col("Customer ID").alias("customer_id"),
#     to_timestamp("Purchase Date").alias("purchase_date"),
#     col("Product Category").alias("category"),
#     col("Product Price").alias("price"),
#     col("Quantity").alias("quantity"),
#     col("Total Purchase Amount").alias("total_amount"),
#     col("Payment Method").alias("payment_method"),
#     col("Age").alias("age"),
#     col("Gender").alias("gender"),
#     col("Churn").alias("churn")
# ).withColumn("month", date_format("purchase_date", "yyyy-MM"))

# @app.route("/api/overview")
# def get_overview():
#     result = df.agg(
#         sum("total_amount").alias("totalRevenue"),
#         countDistinct("purchase_date").alias("totalOrders"),
#         countDistinct("customer_id").alias("newCustomers"),
#         avg("total_amount").alias("avgOrderValue")
#     ).collect()[0].asDict()
#     return jsonify(result)

# @app.route("/api/sales-trends")
# def get_sales_trends():
#     rows = df.groupBy("month").agg(sum("total_amount").alias("total_sales")).collect()
#     return jsonify([row.asDict() for row in rows])

# @app.route("/api/sales-by-category")
# def get_sales_by_category():
#     rows = df.groupBy("category").agg(sum("total_amount").alias("total_sales")).collect()
#     return jsonify([row.asDict() for row in rows])

# if __name__ == "__main__":
#     app.run(debug=True)
