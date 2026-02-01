
console.log("URL checker Loaded");

const Bad_Endings = [".exe", ".zip", ".rar", ".7z", ".tar", ".gz", ".bz2", ".xz", ".iso",".dmg", ".pkg", ".deb", ".rpm", ".msi", ".py",".bat", ".cmd", ".com", ".ps1", ".vbs", ".js", ".scr", ".pif", ".reg",".sh", ".bin", ".run", ".pl", ".cgi",".app", ".command", ".jar", ".pyc", ".apk", ".appimage", ".wsf", ".gadget"];

const VIRUS_API_Key = "5c41436729aacdbe8c02d1707744c3d35b1c51987eabe3de4163086541115f3f";

const GDPR_Country_TLDs = [".at",".be",".bg",".hr",".cy",".cz",".dk",".ee",".fi",".fr",".de",".gr",".hu",".ie",".it",".lv",".lt",".lu",".mt",".nl",".pl",".pt",".ro",".sk",".si",".es",".se",".is",".li",".no",".eu",".uk",".com",".org",".edu",".tv"];
//and tuvalu country for tv as in televesion

const Risk_Classification = { 1: "No Risk", 2: "Low Risk", 3: "Medium Risk", 4: "High Risk", 5: "Very High Risk" };

let Risk_Level = { "Protocol": 0, "Age": 0, Expiration_Date: 0, "TLD": 0, "Redirects": 0, "Virus_Total": 0 };

const Update_Risk_Level = (Risk, Level) => {
    console.log("Updating Risk Level:", Risk, Level);
    Risk_Level[Risk] = Level;
}

const Calculate_Risk_Level = () => {
    let risk_level = 0;
    for (const value of Object.values(Risk_Level)) {
        console.log("Value:", value);
        risk_level += value;
    }
    console.log("Risk level holder:", Risk_Level);
    const fianl_risk_level = risk_level / Object.keys(Risk_Level).length;
    console.log("Final Risk Level:", fianl_risk_level);
    return fianl_risk_level;
}

const Verify_URL = (url) => {  // not secure not good
    
    const regex_ending = /\.([A-Za-z]{2,4})(?=\/|$)/;


    if (url.includes("https://")) {
        Update_Risk_Level("Protocol", 1);
        url = url.replace("https://", "");
        console.log("URL after protocol check:", url);
    }
    else if (url.includes("http://")) {
        Update_Risk_Level("Protocol", 4);
        url = url.replace("http://", "");
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

        const url_new = url.substring(0, tld_index + url_tld.length);
        const url_redirects = url.substring(tld_index + url_tld.length);

        console.log("URL after trimming to ending:", url_new);
        console.log("URL redirects:", url_redirects);
        console.log("URL TLD:", url_tld);

        return { url_new, url_redirects, url_tld };
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

const Analyze_Virus_Total = async (url) => {
    console.warn("Analyzing Virus Total for:", url);

    const result = await chrome.runtime.sendMessage({
        action: "VT-Background-1",
        url: url,
        API_Key: VIRUS_API_Key,
    });
    console.warn("Virus Total response:", result);

    //console.log ("Virus Total stats:", result.data.attributes.stats);
   

    
}




// WHO IS DATA GET AND ANALYZE
const Analyze_WHOIS_Data = async (data,URL_TLD,URL_Redirects,URL_new) => {
    Analyze_Age(data);
    Analyze_Expiration_Date(data);
    Analyze_TLD(URL_TLD);
    Analyze_Redirects(URL_Redirects);
    await Analyze_Virus_Total(URL_new);
}

const Get_WHOIS_Data = async (URL_new, WHOISJSON_API_KEY) => {
    
    if (!WHOISJSON_API_KEY || WHOISJSON_API_KEY.length === 0 || WHOISJSON_API_KEY == null){
        console.error("WHOISJSON_API_KEY not found");
        return null;
    }
    console.log("WHOISJSON_API_KEY:", WHOISJSON_API_KEY);

    if (!URL_new || URL_new.length === 0 || URL_new == null){
        console.error("No URL provided or URL is invalid :" + URL_new);
        return null;
    }

    const endpoint = `https://whoisjson.com/api/v1/whois?domain=${encodeURIComponent(URL_new)}`;
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
            resolve(Cookie_Data.WHOISJSON_API_KEY || "");
        });
    });
};

// CHECK URL FUNCTION (MAIN FUNCTION)
async function Check_URL(url) {
    console.warn("CHECKING_URL.JS:", url);

    const API_2 = await Access_Cookies_API();
    console.log("API_2:", API_2);

    const {url_new, url_redirects, url_tld} = Verify_URL(url) || {};
    console.log("Normalised URL:", url_new);
    console.log("URL Redirects:", url_redirects);
    console.log("URL TLD:", url_tld);
    const whois_data = await Get_WHOIS_Data(url_new, API_2);
    if (whois_data) {
        await Analyze_WHOIS_Data(whois_data,url_tld,url_redirects,url_new);
        return Calculate_Risk_Level();
    }
    else {
        console.error("No WHOIS data found");
        return null;
    }
    
    
}


