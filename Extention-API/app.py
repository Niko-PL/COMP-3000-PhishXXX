from flask import Flask, request, jsonify
import requests

TIMEOUT_SECONDS = 10

app = Flask(__name__)

def get_url_extended(shortened_url: str):

    try:
        redirected_urls = []
        ##redirected_urls.append(shortened_url) ## to include the original url in the list
         
        response = requests.head(shortened_url, allow_redirects=False, timeout=TIMEOUT_SECONDS)

        while 'Location' in response.headers:

            next_url = response.headers['Location']
            redirected_urls.append(next_url)
            response = requests.head(next_url, allow_redirects=False, timeout=TIMEOUT_SECONDS)

            ##next_url = response.headers['Location']
            ##redirected_urls.append(response.url)
            ##response = requests.get(response.url, allow_redirects=False, timeout=TIMEOUT_SECONDS)

        if redirected_urls == []:
            return [shortened_url], shortened_url
    
        Last_Redircet = redirected_urls [len(redirected_urls) - 1]
        
        return redirected_urls,Last_Redircet
    except requests.exceptions.Timeout:
        return 'error', 'Request timed out'
    except requests.exceptions.RequestException as e:
        return 'error', str(e)
    except Exception as e:
        return 'error', str(e)
    
        
  


@app.route('/extend', methods=['GET'])
def extend_url():
    short_url = request.args.get('short_url')
    if not short_url:
        return jsonify({'error': 'Short URL is required and has not been provided or does not exist'}), 400
    
    all_redirected_urls, last_redirected_url = get_url_extended(short_url)
    if all_redirected_urls == 'error':
        return jsonify({'error': all_redirected_urls }), 400

    return jsonify({'extended_url has been made': last_redirected_url, 'original url': short_url, 'All urls redirected': all_redirected_urls }), 200



@app.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'Hello, World!'}), 200


if __name__ == '__main__':
    print("Starting the application...")
    app.run(debug=True)
    print("Application is Shutting Down...")