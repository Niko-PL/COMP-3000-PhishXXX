from calendar import c
from math import e
from textwrap import shorten
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import re
from dotenv import load_dotenv
from db_Controller import check_for_bad_words, load_bad_words
from urllib.parse import urlparse

load_dotenv() ##load the environment variables from the .env file

import redis

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address


storage_url = os.getenv('REDIS_URI')
chrome_extension_id = os.getenv('CHROME_EXTENSION_ID')

if chrome_extension_id is None:
    raise ValueError("CHROME_EXTENSION_ID is not set in the environment variables")
if storage_url is None:
    raise ValueError("REDIS_URI is not set in the environment variables")

app = Flask(__name__)

limiter = Limiter(  ##get remote address from the client and limit the number of requests to the server
    get_remote_address,
    app=app,
    default_limits=["60 per minute", "100 per second"],
    storage_uri=storage_url,

)

TIMEOUT_SECONDS = 10

CORS(app, resources={
    r"/*": {
        "origins": [
            f"chrome-extension://{chrome_extension_id}",
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

print("Loading bad words from the database...")
load_bad_words()  ## load bad words from the database into db_Controller.BAD_WORDS_KEEPER


def check_url(url: str):
    ip_regex = r'^(\d{1,3}\.){3}\d{1,3}$'
    try:

        url_parsed = urlparse(url)
        if not url_parsed.scheme in ('http', 'https'):
            return False

        if re.search(ip_regex, url_parsed.netloc): #if url contains ip say no to url
            return False
        
        if re.search(ip_regex, url_parsed.path): #if url contains ip say no to url
            return False

        return True

    except:
        return 'fatal error'


def get_url_extended(shortened_url: str):

    url_checked = check_url(shortened_url)
    if url_checked == 'fatal error':
        return 'error', 'Fatal error'
    if not url_checked: #falsie means invalid url
        return 'error', 'Invalid URL'

    try:
        redirected_urls = []
        ##redirected_urls.append(shortened_url) ## to include the original url in the list
         
        response = requests.head(shortened_url, allow_redirects=False, timeout=TIMEOUT_SECONDS)

        redirected_urls.append(shortened_url)
        while 'Location' in response.headers and len(redirected_urls) < 10:
            

            next_url = response.headers['Location']
            redirected_urls.append(next_url)
            response = requests.head(next_url, allow_redirects=False, timeout=TIMEOUT_SECONDS)

            ##next_url = response.headers['Location']
            ##redirected_urls.append(response.url)
            ##response = requests.get(response.url, allow_redirects=False, timeout=TIMEOUT_SECONDS)

        if len(redirected_urls) >= 10:
            return 'error', 'Too many redirects'

        
    
        Last_Redircet = redirected_urls [len(redirected_urls) - 1]
        
        return redirected_urls,Last_Redircet
    except requests.exceptions.Timeout:
        return 'error', 'Request timed out'
    except requests.exceptions.RequestException as e:
        return 'error', str(e)
    except Exception as e:
        return 'error', str(e)
    
        
  
@app.route('/<path:path>', methods=['OPTIONS'])
@limiter.exempt
def options(path):
    return "",204


@app.route('/extend', methods=['POST'])
@limiter.limit("60 per minute;5 per second")
def extend_url():
    data = request.get_json()
    print(data)
    short_url = data.get('url')
    print(short_url)
    if not short_url:
        return jsonify({'error': 'Short URL is required and has not been provided or does not exist'}), 400
    
    all_redirected_urls, last_redirected_url = get_url_extended(short_url)
    if all_redirected_urls == 'Too many redirects':
        return jsonify({'error': 'too many redirects', 'all_redirected_urls': all_redirected_urls }), 400
    if all_redirected_urls == 'error':
        return jsonify({'error': all_redirected_urls }), 400

    return jsonify({'extended_url': last_redirected_url, 'original_url': short_url, 'all_urls': all_redirected_urls }), 200



@app.route('/test', methods=['GET'])
@limiter.limit("5 per minute")
def test():
    cient_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
    print(f"/test ping from IP: {cient_ip}")
    result = jsonify({'message': 'Hello, World!'})
    print("HERE")
    print(result)
    print("THERE")
    return result, 200




@app.route('/scan', methods=['POST'])
@limiter.limit("60 per minute;1 per second")
def scan():
    data = request.get_json()
    print(data)
    bad_words_list = data.get('email_words_list')
    if not bad_words_list:
        return jsonify({'error': 'Bad words list is not provided or does not exist'}), 400
    

    bad_words = check_for_bad_words(bad_words_list)
    return jsonify({'bad_words': bad_words}), 200


if __name__ == '__main__':
    print("Starting the application...")
    # HTTP-only (no TLS). Use a reverse proxy for HTTPS in production.
    app.run(debug=True, host='0.0.0.0', port=5443)
    print("Application is Shutting Down...")