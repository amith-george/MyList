import sqlite3

# Connect to (or create) the database
conn = sqlite3.connect('my_movie_list.db')
cursor = conn.cursor()

try:
    # Enable foreign key support
    cursor.execute("PRAGMA foreign_keys=on;")
    print("Foreign key enforcement enabled.")

    # Drop existing tables if they exist
    tables = ["review", "rating", "media", "lists", "users"]
    for table in tables:
        cursor.execute(f"DROP TABLE IF EXISTS {table};")
        print(f"Dropped table if exists: {table}")

    # Create the users table
    cursor.execute('''
    CREATE TABLE users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
    )
    ''')
    print("Created users table.")

    # Create the list table
    cursor.execute('''
    CREATE TABLE lists (
        list_id INTEGER PRIMARY KEY AUTOINCREMENT,
        list_description text,
        user_id INTEGER,
        list_name TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
    ''')
    print("Created list table.")

    # Create the media table
    cursor.execute('''
    CREATE TABLE media (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        media_type TEXT CHECK(media_type IN ('movie', 'tv')),
        user_id INTEGER,
        list_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (list_id) REFERENCES list(list_id) ON DELETE CASCADE
    )
    ''')
    print("Created media table.")

    # Create the review table
    cursor.execute('''
    CREATE TABLE review (
        review_id INTEGER PRIMARY KEY AUTOINCREMENT,
        media_id INTEGER,
        user_id INTEGER,
        review_text TEXT,
        FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
    ''')
    print("Created review table.")

    # Create the rating table
    cursor.execute('''
    CREATE TABLE rating (
        rating_id INTEGER PRIMARY KEY AUTOINCREMENT,
        media_id INTEGER,
        user_id INTEGER,
        rating_value INTEGER CHECK(rating_value >= 1 AND rating_value <= 10),
        FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
    ''')
    print("Created rating table.")

    # Commit the changes
    conn.commit()
    print("All tables created successfully with ON DELETE CASCADE constraints.")

except sqlite3.Error as e:
    print("An error occurred:", e)
    conn.rollback()

finally:
    conn.close()
