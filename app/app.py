from flask import Flask, request, render_template
import pandas as pd
import json

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/upload_csv", methods=["POST"])
def upload_csv():
    if 'file' not in request.files:
        return {"error": "No file part"}, 400
    
    file = request.files['file']
    
    if file.filename == '':
        return {"error": "No selected file"}, 400
    
    if not file.filename.endswith('.csv'):
        return {"error": "File must be a CSV"}, 400
    
    try:
        df = pd.read_csv(file)
        
        summary = {
            "num_rows": len(df),
            "num_columns": len(df.columns),
            "columns": list(df.columns),
            "summary_stats": df.describe().to_dict() if not df.empty else {}
        }
        
        return summary, 200
    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == "__main__":
    app.run(debug=True)