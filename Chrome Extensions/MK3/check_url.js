
console.log("URL checker Loaded");

const Bad_Endings = [".exe", ".zip", ".rar", ".7z", ".tar", ".gz", ".bz2", ".xz", ".iso",".dmg", ".pkg", ".deb", ".rpm", ".msi", ".py",".bat", ".cmd", ".com", ".ps1", ".vbs", ".js", ".scr", ".pif", ".reg",".sh", ".bin", ".run", ".pl", ".cgi",".app", ".command", ".jar", ".pyc", ".apk", ".appimage", ".wsf", ".gadget"];



const GDPR_Country_TLDs = [".at",".be",".bg",".hr",".cy",".cz",".dk",".ee",".fi",".fr",".de",".gr",".hu",".ie",".it",".lv",".lt",".lu",".mt",".nl",".pl",".pt",".ro",".sk",".si",".es",".se",".is",".li",".no",".eu",".uk",".com",".org",".edu",".tv"];
//and tuvalu country for tv as in televesion

const Risk_Classification = { 1: "No Risk", 2: "Low Risk", 3: "Medium Risk", 4: "High Risk", 5: "Very High Risk" };

let Risk_Level = { "Protocol": 0, "Age": 0, Expiration_Date: 0, "TLD": 0, "Redirects": 0, "Virus_Total": 0, "Link_Text": 0, "URL_Chain_Redirects": 0 };

const Update_Risk_Level = (Risk, Level) => {
    console.log("Updating Risk Level:", Risk, Level);
    Risk_Level[Risk] = Level;
}

const Calculate_Risk_Level = () => {
    let risk_level = 0;
    let valid_values = 0;
    for (const value of Object.values(Risk_Level)) {
        console.log("Value:", value);
        if (value != 0) {
            risk_level += value;
            valid_values++;
        }
        
    }
    console.log("Risk level holder:", JSON.stringify(Risk_Level)); 
    const average_risk_level = risk_level / valid_values;
    const final_risk_level = Math.ceil(average_risk_level * 2) / 2;
    console.log("Final Risk Level (rounded up to .5):", final_risk_level);
    return final_risk_level;
}

const Verify_URL = (url) => {  // not secure not good
    
    const regex_ending = /\.([A-Za-z]{2,4})(?=\/|$)/;

    let url_protocol = "";
    if (url.includes("https://")) {
        Update_Risk_Level("Protocol", 1);
        url = url.replace("https://", "");
        url_protocol = "https://";
        console.log("URL after protocol check:", url);
    }
    else if (url.includes("http://")) {
        Update_Risk_Level("Protocol", 4);
        url = url.replace("http://", "");
        url_protocol = "http://";
        console.log("URL after protocol check:", url);
    }
    else {
        Update_Risk_Level("Protocol", 5);
        console.error("URL after Failed to identify protocol. URL:", url);
    }


    const url_data = url.match(regex_ending);
    console.log("URL data:", url_data);

    if (url_data && url_data.index !== undefined) {
        const url_tld = url_data[0]; // The matched TLD (e.g., ".com")
        console.log("URL TLD:", url_tld);
        const tld_index = url_data.index; // The index where the TLD was found

        const url_short = url.substring(0, tld_index + url_tld.length);
        const url_redirects = url.substring(tld_index + url_tld.length);

        console.log("URL after trimming to ending:", url_short);
        console.log("URL redirects:", url_redirects);
        console.log("URL TLD:", url_tld);

        return { url_short, url_redirects, url_tld, url_protocol };
    } else {
        console.error("No URL ending found. Incorrect URL:", url);
        return;
    }

}

const Analyze_Redirects = (url_redirects) => {  // make sure no zip or exe files

    //review if ending is downloadable
    const Regexed_bad_ending = new RegExp(`\(${Bad_Endings.join("|")})$`, "i");

    const matches = Regexed_bad_ending.test(url_redirects);
    console.log("Matches:", matches);

    if (matches) {
        Update_Risk_Level("Redirects", 5);
        console.log("Redirects contains downloadable");
    }
    else {
        Update_Risk_Level("Redirects", 1);
        console.log("Redirects does not contain downloadable");
    }
    //add more checks here for url extentions i.e ( the long part of url after the ending)
}

const Analyze_TLD= (url_tld) => {  // see if registered in reputable country. Good Laws needed
    const Regexed_bad_tld = new RegExp(`\(${GDPR_Country_TLDs.join("|")})$`, "i");
    url_tld = url_tld.trim(); //clean the empty void
    console.log("Regexed bad tld:", Regexed_bad_tld);
    console.log("Idnetified", url_tld, "as TLD");
    if (Regexed_bad_tld.test(url_tld)) {
        Update_Risk_Level("TLD", 1);
        console.log("TLD is in reputable country");
    }
    else {
        Update_Risk_Level("TLD", 5);
        console.log("TLD is not in reputable country");
    }
}

const Analyze_Age = (data) => {  //low age means high risk
    const created_date =
        data?.created || null;


    if (!created_date) {
        console.warn("No created date found in WHOIS payload");
        return;
    }

    const Created_Date_Normalised   = new Date(created_date);
    if (Number.isNaN(Created_Date_Normalised.getTime())) {
        console.warn("Invalid created date in WHOIS payload:", created_date);
        return;
    }

    const age_in_days = (Date.now() - Created_Date_Normalised.getTime()) / (1000 * 60 * 60 * 24);
    console.log("Age in days:", age_in_days);

    if (age_in_days < 30) {
        Update_Risk_Level("Age", 5);
    } else if (age_in_days < 90) {
        Update_Risk_Level("Age", 4);
    } else if (age_in_days < 180) {
        Update_Risk_Level("Age", 3);
    } else if (age_in_days < 365) {
        Update_Risk_Level("Age", 2);
    } else {
        Update_Risk_Level("Age", 1);
    }
}

const Analyze_Expiration_Date = (data) => {  //expired means no good
    const expiration_date = data?.expires || null;

    if (!expiration_date) {
        console.error("No expiration date found in WHOIoS payload");
        Update_Risk_Level("Expiration_Date", 5);
        return;
    }
    const Experation_Date_Normalised = new Date(expiration_date);
    if (Number.isNaN(Experation_Date_Normalised.getTime())) {
        console.warn("Invalid expiration date in WHOIS payload:", expiration_date);
        Update_Risk_Level("Expiration_Date", 5);
        return;
    }

    const experation_in_days = (Experation_Date_Normalised.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    console.log("Experation in days:", experation_in_days);

  
    if (experation_in_days <= 0 ){
        console.warn("Expiration date has expired");
        Update_Risk_Level("Expiration_Date", 5);
    }
    else if (experation_in_days >0)  {
        console.log("Expiration date is in the future");
        Update_Risk_Level("Expiration_Date", 1);
    }
    else {
        console.warn("Expiration date has an issue. Date: " + experation_in_days);
        Update_Risk_Level("Expiration_Date", 5);
    }
}

const Analyze_Virus_Total = async (url,API_Virus_Total, url_protocol,mode) => {
    console.warn("Analyzing Virus Total for:", url);
    console.log("Mode:", mode);
    console.log("URL:", url);
    console.log("API Key:", API_Virus_Total);
    console.log("URL protocol:", url_protocol);

    if (url != url.includes("www.")) {
        url = "www." + url;
    }

    const url_with_protocol = url_protocol + url;  //virust total providers not the best need to standardise the url to (protocol)//:www.domain.xxx


    const result = await chrome.runtime.sendMessage({
        action: "VT-Background-1",
        url: url_with_protocol,
        API_Key: API_Virus_Total,
    });
    console.warn("Virus Total response:", result);

    const Virus_Total_STATS = result.data.attributes.stats;
    const VT_Harmless = parseInt(Virus_Total_STATS.harmless);
    const VT_Malicious = parseInt(Virus_Total_STATS.malicious);
    const VT_Suspicious = parseInt(Virus_Total_STATS.suspicious);
    const VT_Undetected = parseInt(Virus_Total_STATS.undetected);

    try {
    if (VT_Malicious > 0) {
        console.warn("Virus Total is malicious");
        Update_Risk_Level("Virus_Total", 5);
        return true;
    }
    else if (VT_Suspicious > 0) {
        console.warn("Virus Total is suspicious");
        Update_Risk_Level("Virus_Total", 3);
        return true;
    }
    else if (VT_Harmless > 0) {
        console.warn("Virus Total is harmless");
        Update_Risk_Level("Virus_Total", 1);
        return true;
    }
    else if (VT_Undetected > 0) {
        console.warn("Virus Total is undetected");
        Update_Risk_Level("Virus_Total", 2);
        return true;
    }
    else {
        console.warn("Virus Total is unknown passed all checks");
        Update_Risk_Level("Virus_Total", 0);
        return false;
    }
    }
    catch (error) {
        console.warn("Virus Total error:", error);
        Update_Risk_Level("Virus_Total", 0);
    }



    //console.log ("Virus Total stats:", result.data.attributes.stats);
   

    
}

const Analyze_Link_Text = (url_href, url_text, url_extended) => {
    console.log("Analyzing link text:", url_text);
    console.log("Analyzing link extended:", url_extended);
    
    const {url_short: url_href_verified, url_redirects: url_href_redirects, url_tld: url_href_tld} = Verify_URL(url_href) // original url short
    const {url_short: url_extended_verified, url_redirects: url_extended_redirects, url_tld: url_extended_tld} = Verify_URL(url_extended) //extended url short
    const {url_short: url_text_verified, url_redirects: url_text_redirects, url_tld: url_text_tld} = Verify_URL(url_text) //text url short

    console.log("Href short verified:", url_href_verified);
    console.log("Extended short verified:", url_extended_verified);
    console.log("Text short verified:", url_text_verified);
    

    if (url_href_verified == url_extended_verified && url_text_verified == url_extended_verified  &&  url_href_verified== url_text_verified) {
        Update_Risk_Level("Link_Text", 1);
    }
    else if (url_extended_verified == url_text_verified){
        Update_Risk_Level("Link_Text", 3);
        console.log("Link redirects to the correct domain"); //but the text has a redirect before reaching the domain as the href stored
    }
    else {
        Update_Risk_Level("Link_Text", 5);
        console.log("Link text does not match the href and extended"); //but the text has a redirect before reaching the domain as the href stored
    }

}

const Analyze_URL_Chain_Redirects = async (url) => { // check if the url redirects to websites of other domains

    const result = await chrome.runtime.sendMessage({
        action: "URL-API-Background-1", url: url
    });
    console.log("URL API test data:", result.error);

    if (result.error == "Error during fetch operation:") {
        return result.error;
    }

    if (result.error && result.error.includes("404")) {
        return null;
    }

    const url_extended = result.extended_url;
    const url_original = result.original_url;
    const url_all = result.all_urls;

    if (url_extended == null || url_extended == undefined || url_extended == "") {
        console.error("No URL extended found");
        return null;
    }

    if (url_all.length == 1 && url_original == url_extended){
        Update_Risk_Level("URL_Chain_Redirects", 1);
        console.log("URL chain redirects contains one");
    }
    else if (url_all.length == 2 && url_original != url_extended){
        Update_Risk_Level("URL_Chain_Redirects", 2);
        console.log("URL chain redirects contains 2 URLs");
    }
    else if (url_all.length == 3 && url_original != url_extended){
        Update_Risk_Level("URL_Chain_Redirects", 3);
        console.log("URL chain redirects contains 3 URLs");
    }
    else if (url_all.length > 3 && url_original != url_extended){
        Update_Risk_Level("URL_Chain_Redirects", 5);
        console.log("URL chain redirects contains multiple URLs");
    }
    else if (url_all.length <= 0 && url_original == url_extended){
        Update_Risk_Level("URL_Chain_Redirects", 0); //1 url original is 
        console.error("URL chain redirects contains zero urls error");
    }
    else {
        Update_Risk_Level("URL_Chain_Redirects", 0);
        console.error("URL error occured");
    }



    console.log("URL extended:", url_extended);
    console.log("URL original:", url_original);
    console.log("URL all:", url_all);

    return url_extended;


}


const TEST_URL_Chain_Redirects = async (url) => {
    console.log("TESTING URL CHAIN REDIRECTS");
    const result = await chrome.runtime.sendMessage({
        action: "URL-API-Background-2",
    });
    console.log("URL API test data:", result);


}



// WHO IS DATA GET AND ANALYZE
const Analyze_WHOIS_Data = async (data,URL_TLD,URL_Redirects) => {
    Analyze_Age(data);
    Analyze_Expiration_Date(data);
    Analyze_TLD(URL_TLD);
    Analyze_Redirects(URL_Redirects);
}

const Get_WHOIS_Data = async (url_short, WHOISJSON_API_KEY) => {
    
    if (!WHOISJSON_API_KEY || WHOISJSON_API_KEY.length === 0 || WHOISJSON_API_KEY == null){
        console.error("WHOISJSON_API_KEY not found");
        return null;
    }
    console.log("WHOISJSON_API_KEY:", WHOISJSON_API_KEY);

    if (!url_short || url_short.length === 0 || url_short == null){
        console.error("No URL provided or URL is invalid: " + url_short);
        return null;
    }

    const endpoint = `https://whoisjson.com/api/v1/whois?domain=${encodeURIComponent(url_short)}`;
    const response = await fetch(endpoint, { headers: { Authorization: `TOKEN=${WHOISJSON_API_KEY}` } });
    if (!response.ok) {
        throw new Error(`WhoisJSON request failed (${response.status} ${response.statusText})`);
    }
    const data = await response.json();
    console.log("WhoisJSON data:", data);
    return data;
}

/// END OF WHO IS STUFF

const Access_Cookies_API = () => {  //get the cookies api key for who is
    return new Promise((resolve) => {
        chrome.storage.sync.get((Cookie_Data) => {
            // Return both keys in an array
            resolve([
                Cookie_Data.WHOISJSON_API_KEY || "",
                Cookie_Data.Virus_Total_API_KEY || ""
            ]);
        });
    });
};



// CHECK URL FUNCTION (MAIN FUNCTION)
async function Check_URL(url, link_text) {
    console.warn("CHECKING_URL.JS:", url);
    console.log("Link text:", link_text);

    // Reset Risk_Level so each URL analysis starts fresh (avoids stale data from previous links)
    Risk_Level = { "Protocol": 0, "Age": 0, Expiration_Date: 0, "TLD": 0, "Redirects": 0, "Virus_Total": 0, "Link_Text": 0, "URL_Chain_Redirects": 0 };

    let url_extended = await Analyze_URL_Chain_Redirects(url); // check if the url redirects to websites of other domains (we wnat final destitinaton url)

    if (url_extended == null) {
        console.error("No URL extended likley due to server down found massive error");
        const server_alive = await chrome.runtime.sendMessage({action: "Alive_Hussar_API"});
        if (server_alive) {
            url_extended = await Analyze_URL_Chain_Redirects(url);
        }
        else {
            console.error("Server is not alive")
        }
          
    }
    
    if (url_extended == null) {
        console.error("No URL extended found using original url");
        url_extended = url;
    }


    const API_Keys = await Access_Cookies_API();
    const API_WHOISJSON = API_Keys[0];
    const API_Virus_Total = API_Keys[1];
    console.log("API_Keys:", API_WHOISJSON + " " + API_Virus_Total);
    

    const {url_short, url_redirects, url_tld, url_protocol} = Verify_URL(url_extended) || {};
    console.log("Normalised URL:", url_short);
    console.log("URL Redirects:", url_redirects);
    console.log("URL TLD:", url_tld);

    

    const whois_data = await Get_WHOIS_Data(url_short, API_WHOISJSON);
    if (whois_data) {
        let virus_total_attempts = 0;
        await Analyze_WHOIS_Data(whois_data,url_tld,url_redirects);
        let virus_total_result = await Analyze_Virus_Total(url_short, API_Virus_Total, url_protocol,1);
        
        while (!virus_total_result && virus_total_attempts < 5 && Risk_Level.Virus_Total != 0) {
            virus_total_attempts++;
            virus_total_result = await Analyze_Virus_Total(url_short, API_Virus_Total, url_protocol,2);
        }
        if (link_text == 'Image//Link//This//is//an//image//link') {
            Update_Risk_Level("Link_Text", 1); //no text likley an image link
        }
        else {
            Analyze_Link_Text(url_short, link_text, url_extended);
        }
        return Calculate_Risk_Level();
    }
    else {
        console.error("No WHOIS data found");
        return null;
    }
    
    
}


