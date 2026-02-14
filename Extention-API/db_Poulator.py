import sqlite3


test_words = ["the", "cat", "sat", "on", "the", "mat","this","that","bat","you","few","long"]

connection =sqlite3.connect('Bad_Words.db')
cursor = connection.cursor()

for word in test_words:
    cursor.execute('''INSERT INTO Bad_Words (bad_word) VALUES (?)''', (word.lower(),))

connection.commit()
connection.close()

print("Database populated successfully")