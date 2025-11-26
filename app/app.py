from flask import Flask, request, render_template, jsonify
import traceback
import pandas as pd
import json
import re

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/upload_csv", methods=["POST"])
def upload_csv():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if not file.filename.endswith('.csv'):
        return jsonify({"error": "File must be a CSV"}), 400
    
    try:
        df = pd.read_csv(file)
        
        summary = {
            "num_rows": len(df),
            "num_columns": len(df.columns),
            "columns": list(df.columns),
            "summary_stats": df.describe().to_dict() if not df.empty else {}
        }
        
        # Get value counts for categorical columns
        responses = {}
        for col in df.select_dtypes(include=['object']).columns:
            try:
                value_counts = df[col].value_counts(dropna=True)
                
                # Check if this column contains percentage values
                sample_values = [str(k) for k in value_counts.index[:3]]
                is_percentage_col = any('%' in str(v) for v in sample_values)
                
                if is_percentage_col:
                    # Sort by extracting numeric value from percentage strings
                    def extract_number(s):
                        match = re.search(r'(\d+)', str(s))
                        return int(match.group(1)) if match else 0
                    
                    sorted_items = sorted(value_counts.items(), key=lambda x: extract_number(x[0]))
                    responses[col] = {str(k): int(v) for k, v in sorted_items}
                else:
                    # Regular sorting for non-percentage columns
                    responses[col] = {
                        str(k) if pd.notna(k) else "Missing": int(v) 
                        for k, v in value_counts.items()
                    }
                    
            except (TypeError, ValueError) as e:
                print(f"Skipping column {col}: {e}")
                continue
        
        summary["responses"] = responses
        
        return jsonify(summary), 200
    except Exception as e:
        print("ERROR:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)