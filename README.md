# Google-Trends-Extractor
This project helps with the bulk extraction of data from Google Trends. Their web application only allows 5 keywords to be downloaded at a time.

As such, I used Pytrends API requests in python to extract data for a larger set of keywords.

The user uploads an Excel file containing all the required keywords on a single column and then the application makes a request to Google to extract the interest over time metric for each one.

After that, the data is called on the frontend using fetch from the python server and builds a new Excel containing the monthly data for each keyword. 
