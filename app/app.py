from flask import Flask, request, jsonify, render_template
from analysis import process_taps_data  # Importing your function

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/upload_csv', methods=['POST'])
def upload_csv():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # We pass the file stream directly to your worker function
        response_data = process_taps_data(file)
        return jsonify(response_data)

    except ValueError as e:
        # Catch specific errors from your analysis code
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        # Catch unexpected server errors
        return jsonify({'error': f"Server Error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)