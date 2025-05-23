from pyspark.sql import SparkSession
from pyspark.sql.functions import sum, count, avg, col, round as rnd
from pyspark.sql.functions import countDistinct


# Create Spark session
spark = SparkSession.builder.appName("EcommerceDashboardAnalysis").getOrCreate()

# Load dataset
df = spark.read.csv("E-commerce data.csv", header=True, inferSchema=True)

# Ensure numeric fields are clean
df = df.filter("`Total Purchase Amount` IS NOT NULL AND Quantity IS NOT NULL AND `Customer ID` IS NOT NULL")

# 📊 Overview Metrics
overview = df.select(
    rnd(sum("Total Purchase Amount"), 2).alias("totalRevenue"),
    count("*").alias("totalOrders"),
    countDistinct("Customer ID").alias("uniqueCustomers"),
    rnd(avg("Total Purchase Amount"), 2).alias("avgOrderValue")
)

overview.coalesce(1).write.mode("overwrite").json("data/spark_output/overview")

# 📍 Revenue by Product Category
category_sales = df.groupBy("Product Category") \
    .agg(rnd(sum("Total Purchase Amount"), 2).alias("revenue")) \
    .orderBy(col("revenue").desc())

category_sales.coalesce(1).write.mode("overwrite").json("data/spark_output/category_sales")

# 🔁 Returns Rate by Category
returns = df.groupBy("Product Category") \
    .agg(
        count("*").alias("totalOrders"),
        sum("Returns").alias("returnedOrders")
    ) \
    .withColumn("returnRate", rnd((col("returnedOrders") / col("totalOrders")) * 100, 2)) \
    .select("Product Category", "returnRate") \
    .orderBy(col("returnRate").desc())

returns.coalesce(1).write.mode("overwrite").json("data/spark_output/returns_rate")
spark.stop()


print("✅ Spark job completed. Output written to:")
print(" - data/spark_output/overview")
print(" - data/spark_output/category_sales")
print(" - data/spark_output/returns_rate")
