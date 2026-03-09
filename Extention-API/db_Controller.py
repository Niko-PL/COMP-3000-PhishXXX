
import sqlite3
import re


BAD_WORDS_KEEPER = set()





def tokenize(text: str): ##tokenize the text (turn text into a list of words)
    return re.findall(r'\b\w+\b', text.lower())


def load_bad_words(): ##load bad words from the database into db_Controller.BAD_WORDS_KEEPER
    global BAD_WORDS_KEEPER

    connection = sqlite3.connect('Bad_Words.db')
    cursor = connection.cursor()
    
    cursor.execute('''SELECT bad_word FROM Bad_Words''')
    bad_words = cursor.fetchall()
    
    # Mutate in place so any existing references to BAD_WORDS_KEEPER stay valid.
    BAD_WORDS_KEEPER.clear()
    BAD_WORDS_KEEPER.update(
        badword[0].lower() for badword in bad_words if badword[0]
    )
    connection.close()


    


def check_for_bad_words(text: str): ##return a set of bad words


    tokens = tokenize(text)
    return list( dict.fromkeys([token for token in tokens if token in BAD_WORDS_KEEPER])) ##return a list of unique bad words



    





