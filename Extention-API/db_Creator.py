import sqlite3
connection= sqlite3.connect('Bad_Words.db')

cursor = connection.cursor()


cursor.execute('''CREATE TABLE IF NOT EXISTS Bad_Words (id INTEGER PRIMARY KEY AUTOINCREMENT, bad_word TEXT, date_added TEXT DEFAULT CURRENT_TIMESTAMP)''')

connection.commit()
connection.close()

print("Database created successfully")