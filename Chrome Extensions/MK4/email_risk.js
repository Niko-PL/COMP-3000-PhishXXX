



const Email_Risk_MAIN = async (email_body_clean) => {
    console.log("Email risk using ngram");
    //controlls
    
    const NGRAM1_THRESHOLD = 1.65
    const NGRAM2_THRESHOLD = 1.44


    console.log("NGRAM1_THRESHOLD:", NGRAM1_THRESHOLD);
    console.log("NGRAM2_THRESHOLD:", NGRAM2_THRESHOLD);

    try {
    const dataset_ngram2= await LOAD_CSV_dataset(2);
    //const dataset_ngram1= await LOAD_CSV_dataset("ngram risk scores/phishing_language_1gram.csv");

    const ngram2_map = NGRAM_Map_maker(dataset_ngram2);
    //const ngram1_map = NGRAM_Map_maker(dataset_ngram1);


    const email_ngram_2 = email_to_ngrams(email_body_clean, 2);
    console.log("Email ngram 2:", email_ngram_2.ngrams);
    console.log("Email length:", email_ngram_2.email_length);

    //const email_ngram_1 = email_to_ngrams(email_body_clean, 1);
    //console.log("Email ngram 1:", email_ngram_1);


    const email_2ngram_returned = Calulate_NGRAM(email_ngram_2.ngrams, ngram2_map, NGRAM2_THRESHOLD , email_ngram_2.email_length);
    console.log("Email 2ngram returned:", email_2ngram_returned);




    return {bad_words : email_2ngram_returned.bad_words, risk : email_2ngram_returned.risk};
    }
    catch (error) {
        console.error("Error in Email_Risk_MAIN TRY-CATCH:", error);
        return null;
    }
}


const LOAD_CSV_dataset =  async (mode) => {

    const file_text = await chrome.runtime.sendMessage({action: "GET_NGRAM_CSV", mode: mode});
    if (!file_text || file_text.error) {
        throw new Error(file_text?.error || "Failed to load CSV file");
    }

    return file_text.csv_text;
}

const NGRAM_Map_maker = (dataset) => {
    const ngram_map = new Map();
    const lines = dataset.split(/\r?\n/);

    for (let i = 1 ; i < lines.length ; i++) { //skip header innit
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(",");
        if (parts.length != 6) continue; //6 is the number of columns in the csv file

        const phish_score = parseFloat(parts[5]); // phish scofer 6th column
        if (isNaN(phish_score)) continue;

        const ngram = parts[0]; // ngram 1st column
        if (!ngram) continue;

        ngram_map.set(ngram, phish_score); //set the ngram and phish score in the map

    }
    console.log ("NGRAM Map made with", ngram_map.size, "entries");
    return ngram_map;
}

const email_to_ngrams = (email_body_clean , mode) => {
    const words_clean = email_body_clean.toLowerCase().trim().split(/\s+/);  //should be clean but double check
    console.log("NGRAM READY CLEAN EMAIL BODY:", words_clean);
    const ngrams = [];

    //mode = 1 ngram 1 / mode = 2 ngram 2
    const email_length = words_clean.length;

    for (let i = 0; i <= words_clean.length - mode; i++) {
        ngrams.push(words_clean.slice(i, i + mode).join(" "));;
    }

    
    return { ngrams : ngrams, email_length : email_length };

}

const Calulate_NGRAM = (ngram, ngram_map, NGRAM_THRESHOLD, email_length) => {  //get trisk and who to highlight
    const bad_words = new Set();
    let risk = 0;

    for (const ngram_item of ngram) {
        if (!ngram_map.has(ngram_item)) continue; //if the ngram is not in the map, continue
        const ngram_risk_Score = ngram_map.get(ngram_item);
        risk += ngram_risk_Score;

        if (ngram_risk_Score > NGRAM_THRESHOLD) {
            bad_words.add(ngram_item);
        }
    }
    risk = risk / (email_length - 1);
    // > 0.32 means high risk
    // >= 0.16 means medium risk
    // < 0.16 means low risk
    // < 0.08 means clean

    console.log("NGRAM 2 HIGHLIGHT:", bad_words);
    console.log("NGRAM RISK:", risk);

    return {
        bad_words: bad_words,
        risk: risk
    };
}












