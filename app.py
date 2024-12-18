from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import sqlite3
import hashlib
import requests
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'your_secret_key'
API_KEY = 'fc8463639c629603510c00b858fe86e6'  # Replace with your TMDb API key
ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmYzg0NjM2MzljNjI5NjAzNTEwYzAwYjg1OGZlODZlNiIsIm5iZiI6MTczMTE1NTIwMy45MTc1ODI4LCJzdWIiOiI2NzFiMjA3YTZkNmI3MDVkYzg3MTRiN2EiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.axFyIATY2yCgCbu3PLzZl2iZl0is6l45q_jdEIILugY'

def get_db_connection():
    conn = sqlite3.connect('my_movie_list.db')  # Update database name
    conn.row_factory = sqlite3.Row
    return conn


@app.route('/')
def index():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    conn = get_db_connection()
    lists = conn.execute('SELECT * FROM lists WHERE user_id = ?', (session['user_id'],)).fetchall()
    conn.close()
    return render_template('index.html', lists=lists)



@app.route('/home', methods=['GET'])
def home():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    user_name = session.get('user_name', 'User')
    total_media_items = []

    # Retrieve data from multiple pages (e.g., first 5 pages)
    for api_page in range(1, 6):
        media_url = f'https://api.themoviedb.org/3/movie/popular?api_key={API_KEY}&language=en-US&page={api_page}'
        media_items = requests.get(media_url).json().get('results', [])
        total_media_items.extend(media_items)

    # Remove duplicates based on 'id'
    unique_media_items = {item['id']: item for item in total_media_items}.values()

    # Sort by release date (newest first) and then by popularity (highest)
    def get_release_date(item):
        try:
            return datetime.strptime(item.get('release_date', ''), '%Y-%m-%d')
        except ValueError:
            return datetime.min  # Assign earliest possible date if invalid

    total_media_items = sorted(unique_media_items, key=lambda x: (get_release_date(x), x.get('popularity', 0)), reverse=True)

    # Limit to 24 items
    limited_media_items = total_media_items[:24]

    return render_template('home.html', user_name=user_name, media_items=limited_media_items)






@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        conn = get_db_connection()
        user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
        conn.close()

        if user:
            input_password_hash = hashlib.sha256(password.encode()).hexdigest()
            stored_password_hash = user['password_hash']
            if input_password_hash == stored_password_hash:
                session['user_id'] = user['user_id']
                session['user_name'] = user['name']  # Store user name for later use
                return redirect(url_for('home'))
            else:
                return 'Invalid credentials. Please try again.'
        else:
            return 'Invalid credentials. Please try again.'
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']
        password_hash = hashlib.sha256(password.encode()).hexdigest()

        conn = get_db_connection()
        conn.execute('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', (name, email, password_hash))
        conn.commit()
        conn.close()
        return redirect(url_for('login'))

    return render_template('signup.html')



@app.route('/create_list', methods=['GET', 'POST'])
def create_list():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    if request.method == 'POST':
        list_name = request.form['list_name']
        list_description = request.form['list_description']
        conn = get_db_connection()
        conn.execute('INSERT INTO lists (list_name, list_description, user_id) VALUES (?, ?, ?)', (list_name, list_description, session['user_id']))
        conn.commit()
        conn.close()
        return redirect(url_for('index'))

    return render_template('create_list.html')



@app.route('/view_list/<int:list_id>', methods=['GET'])
def view_list(list_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))

    media_details = []
    try:
        conn = get_db_connection()
        media_items = conn.execute(
            '''SELECT id, media_type, title, user_id, list_id
               FROM media
               WHERE list_id = ? AND user_id = ?''',
            (list_id, session['user_id'])
        ).fetchall()

        for item in media_items:
            media_id = item['id']
            media_type = item['media_type']
            api_url = f'https://api.themoviedb.org/3/{media_type}/{media_id}?api_key={API_KEY}'
            response = requests.get(api_url)
            if response.status_code == 200:
                response_data = response.json()
                
                media_info = {
                    'media_id': media_id,
                    'media_type': media_type,
                    'poster_path': response_data.get('poster_path'),
                    'release_year': 'Unknown'
                }

                if media_type == 'movie' and 'title' in response_data:
                    media_info['media_name'] = response_data['title']
                    media_info['release_year'] = response_data.get('release_date', 'Unknown')[:4]
                elif media_type == 'tv' and 'name' in response_data:
                    media_info['media_name'] = response_data['name']
                    media_info['release_year'] = response_data.get('first_air_date', 'Unknown')[:4]
                
                media_details.append(media_info)
                
    except Exception as e:
        print(f"An error occurred: {e}")
        return render_template('error.html', error=str(e))

    return render_template('view_list.html', list_id=list_id, media_items=media_details)






@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('login'))



@app.route('/add_to_list/<int:list_id>', methods=['GET', 'POST'])
def add_to_list(list_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))

    search_query = request.form.get('search_query', '')
    movies, shows = [], []
    error = None

    if search_query:
        # Existing search functionality
        url = f'https://api.themoviedb.org/3/search/movie?query={search_query}&api_key={API_KEY}'
        response = requests.get(url).json()
        if 'results' in response:
            movies = [movie for movie in response['results'] if movie.get('poster_path')]
        elif 'status_message' in response:
            error = response['status_message']

        url = f'https://api.themoviedb.org/3/search/tv?query={search_query}&api_key={API_KEY}'
        response = requests.get(url).json()
        if 'results' in response:
            shows = [show for show in response['results'] if show.get('poster_path')]
        elif 'status_message' in response:
            error = response['status_message']
    else:
        # Fetch popular movies if no search query is provided
        total_movies = []
        for api_page in range(1, 6):
            media_url = f'https://api.themoviedb.org/3/movie/popular?api_key={API_KEY}&language=en-US&page={api_page}'
            media_items = requests.get(media_url).json().get('results', [])
            total_movies.extend(media_items)

        # Remove duplicates and sort by release date and popularity
        unique_movies = {item['id']: item for item in total_movies}.values()

        def get_release_date(item):
            try:
                return datetime.strptime(item.get('release_date', ''), '%Y-%m-%d')
            except ValueError:
                return datetime.min

        movies = sorted(unique_movies, key=lambda x: (get_release_date(x), x.get('popularity', 0)), reverse=True)[:24]

    return render_template('add_to_list.html', list_id=list_id, movies=movies, shows=shows, error=error, search_query=search_query)



@app.route('/movie_details/<int:media_id>', methods=['GET'])
def movie_details(media_id):
    response = requests.get(f'https://api.themoviedb.org/3/movie/{media_id}?api_key={API_KEY}&append_to_response=credits')
    if response.status_code == 200:
        return jsonify(response.json())
    
    return jsonify({'error': 'Media not found'}), 404

@app.route('/tv_details/<int:media_id>', methods=['GET'])
def tv_details(media_id):
    response = requests.get(f'https://api.themoviedb.org/3/tv/{media_id}?api_key={API_KEY}&append_to_response=credits')
    if response.status_code == 200:
        return jsonify(response.json())
    
    return jsonify({'error': 'Media not found'}), 404




@app.route('/add_media', methods=['POST'])
def add_media():
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'User not logged in.'}), 401

    data = request.get_json()
    media_id = data.get('media_id')
    title = data.get('title')
    list_id = data.get('list_id')
    media_type = data.get('media_type')
    rating_value = data.get('rating')
    review_text = data.get('review')
    user_id = session['user_id']

    conn = get_db_connection()
    
    try:
        conn.execute('INSERT INTO media (id, title, list_id, user_id, media_type) VALUES (?, ?, ?, ?, ?)',
                     (media_id, title, list_id, user_id, media_type))

        if rating_value:
            conn.execute('INSERT INTO rating (media_id, user_id, rating_value) VALUES (?, ?, ?)',
                         (media_id, user_id, rating_value))

        if review_text:
            conn.execute('INSERT INTO review (media_id, user_id, review_text) VALUES (?, ?, ?)',
                         (media_id, user_id, review_text))

        conn.commit()
        return jsonify({'success': True})

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

    finally:
        conn.close()




@app.route('/check_if_added/<int:list_id>/<int:media_id>')
def check_if_added(list_id, media_id):
    if 'user_id' not in session:
        return jsonify({'alreadyAdded': False})

    conn = get_db_connection()
    media_in_list = conn.execute(
        '''SELECT rating.rating_value, review.review_text
           FROM media
           LEFT JOIN rating ON media.id = rating.media_id
           LEFT JOIN review ON media.id = review.media_id
           WHERE media.id = ? AND media.list_id = ? AND media.user_id = ?''',
        (media_id, list_id, session['user_id'])
    ).fetchone()
    conn.close()

    if media_in_list:
        return jsonify({
            'alreadyAdded': True,
            'rating_value': media_in_list['rating_value'],
            'review_text': media_in_list['review_text']
        })
    else:
        return jsonify({'alreadyAdded': False})


@app.route('/update_list/<int:list_id>', methods=['GET', 'POST'])
def update_list(list_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))

    conn = get_db_connection()

    # Fetch media items for the list along with ratings and reviews
    media_details = []
    try:
        media_items = conn.execute('SELECT * FROM media WHERE list_id = ?', (list_id,)).fetchall()

        for item in media_items:
            media_id = item['id']
            media_type = item['media_type']
            api_url = f'https://api.themoviedb.org/3/{media_type}/{media_id}?api_key={API_KEY}'
            response = requests.get(api_url)
            media_info = {
                'media_id': media_id,
                'media_type': media_type,
                'poster_path': None,
                'media_name': None,
                'release_year': 'Unknown',
                'rating_value': None,
                'review_text': None
            }

            # Fetch media details from the API
            if response.status_code == 200:
                response_data = response.json()
                media_info['poster_path'] = response_data.get('poster_path')
                if media_type == 'movie' and 'title' in response_data:
                    media_info['media_name'] = response_data['title']
                    media_info['release_year'] = response_data.get('release_date', 'Unknown')[:4]
                elif media_type == 'tv' and 'name' in response_data:
                    media_info['media_name'] = response_data['name']
                    media_info['release_year'] = response_data.get('first_air_date', 'Unknown')[:4]

            # Get the review and rating from the database
            rating = conn.execute('SELECT rating_value FROM rating WHERE media_id = ? AND user_id = ?', (media_id, session['user_id'])).fetchone()
            review = conn.execute('SELECT review_text FROM review WHERE media_id = ? AND user_id = ?', (media_id, session['user_id'])).fetchone()

            if rating:
                media_info['rating_value'] = rating['rating_value']
            if review:
                media_info['review_text'] = review['review_text']

            media_details.append(media_info)
        
    except Exception as e:
        print(f"An error occurred: {e}")
        return render_template('error.html', error=str(e))
    finally:
        conn.close()

    return render_template('update_list.html', list_id=list_id, media_items=media_details)


@app.route('/save_rating_and_review', methods=['POST'])
def save_rating_and_review():
    if 'user_id' not in session:
        return jsonify({'error': 'User not logged in'}), 401
    
    media_id = request.form['media_id']
    rating_value = request.form['rating_value']
    review_text = request.form['review_text']

    conn = get_db_connection()
    try:
        # Update the rating if it exists for the media_id and user_id
        rows_updated = conn.execute('''UPDATE rating 
                                      SET rating_value = ? 
                                      WHERE media_id = ? AND user_id = ?''', 
                                      (rating_value, media_id, session['user_id'])).rowcount
        
        # If no rows were updated, return an error message
        if rows_updated == 0:
            return jsonify({'error': 'Rating not found for this media or user'}), 404

        # Update the review if it exists for the media_id and user_id
        rows_updated = conn.execute('''UPDATE review 
                                      SET review_text = ? 
                                      WHERE media_id = ? AND user_id = ?''', 
                                      (review_text, media_id, session['user_id'])).rowcount
        
        # If no rows were updated, return an error message
        if rows_updated == 0:
            return jsonify({'error': 'Review not found for this media or user'}), 404

        conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()







@app.route('/delete_from_list/<int:list_id>', methods=['GET', 'POST'])
def delete_from_list(list_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))

    media_details = []
    try:
        conn = get_db_connection()
        media_items = conn.execute(
            '''SELECT id, media_type, title, user_id, list_id
               FROM media
               WHERE list_id = ? AND user_id = ?''',
            (list_id, session['user_id'])
        ).fetchall()

        for item in media_items:
            media_id = item['id']
            media_type = item['media_type']
            api_url = f'https://api.themoviedb.org/3/{media_type}/{media_id}?api_key={API_KEY}'
            response = requests.get(api_url)
            if response.status_code == 200:
                response_data = response.json()
                
                media_info = {
                    'media_id': media_id,
                    'media_type': media_type,
                    'poster_path': response_data.get('poster_path'),
                    'release_year': 'Unknown'
                }

                if media_type == 'movie' and 'title' in response_data:
                    media_info['media_name'] = response_data['title']
                    media_info['release_year'] = response_data.get('release_date', 'Unknown')[:4]
                elif media_type == 'tv' and 'name' in response_data:
                    media_info['media_name'] = response_data['name']
                    media_info['release_year'] = response_data.get('first_air_date', 'Unknown')[:4]
                
                media_details.append(media_info)
                
    except Exception as e:
        print(f"An error occurred: {e}")
        return render_template('error.html', error=str(e))

    return render_template('delete_from_list.html', list_id=list_id, media_items=media_details)


@app.route('/delete_media_from_list/<int:list_id>/<int:media_id>', methods=['POST'])
def delete_media_from_list(list_id, media_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    try:
        conn = get_db_connection()
        
        # Start a transaction to ensure all related records are deleted
        conn.execute('BEGIN')
        
        # Delete from the media table
        conn.execute(
            '''DELETE FROM media
               WHERE list_id = ? AND id = ? AND user_id = ?''',
            (list_id, media_id, session['user_id'])
        )
        
        # Delete from the rating table
        conn.execute(
            '''DELETE FROM rating
               WHERE media_id = ? AND user_id = ?''',
            (media_id, session['user_id'])
        )
        
        # Delete from the review table
        conn.execute(
            '''DELETE FROM review
               WHERE media_id = ? AND user_id = ?''',
            (media_id, session['user_id'])
        )
        
        # Commit the transaction
        conn.commit()
        
        return jsonify({'success': True})

    except Exception as e:
        # If any error occurs, rollback the transaction
        conn.execute('ROLLBACK')
        print(f"Error deleting media and related records: {e}")
        return jsonify({'success': False})





if __name__ == '__main__':
    app.run(debug=True)
