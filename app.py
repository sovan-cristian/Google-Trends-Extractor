from flask import Flask, request, jsonify, render_template
from pytrends.request import TrendReq
from datetime import datetime
import pandas as pd
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

@app.route('/get_trends_data', methods=['POST'])
def get_trends_data():
    keywords = request.json['keywords']
    pytrends = TrendReq(hl='en-US', tz=360)

    trends_data = []
    all_months = set()
    for keyword in keywords:
        pytrends.build_payload([keyword], cat=0, timeframe='today 5-y', geo='', gprop='')
        data = pytrends.interest_over_time()
        if not data.empty:
            data = data.drop(columns=['isPartial'])
            data = data.transpose()
            data.columns = pd.to_datetime(data.columns)
            keyword_data = {'name': keyword, 'months': {}}  # Include 'months' object
            for column in data.columns:
                month_key = f"{column.month:02d}-{column.year}"
                month_value = int(data[column][0])
                keyword_data['months'][month_key] = month_value  # Add month data to 'months' object
                all_months.add(month_key)
            trends_data.append(keyword_data)
        else:
            trends_data.append({'name': keyword, 'months': {}})

    sorted_months = sorted(all_months, key=lambda x: datetime.strptime(x, '%m-%Y'))

    for data in trends_data:
        data['months'] = {month: data['months'].get(month, 0) for month in sorted_months}  # Filter 'months' object

    json_data = json.dumps(trends_data)  # Convert the trends data to JSON

    return json_data, 200, {'Content-Type': 'application/json'}  # Return JSON response

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
