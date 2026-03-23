//here we will control the buttons and UI on the extention.html 
//it also controlls html on the gmail page
//changed to version 2.0

document.addEventListener('DOMContentLoaded', async () => { // Ensure the external extension DOM is fully loaded
    console.log("DOM Content Loaded");
    console.log("Content script loaded on:", window.location.href);



    const Hussar_API_Status = document.getElementById("Hussar_API_Status");
    const WHOIS_API_Status = document.getElementById("WHOIS_API_Status");
    const Virus_Total_API_Status = document.getElementById("Virus_Total_API_Status");

    const Warning_Message_Size = document.getElementById("warning_message_size");
    const Word_Highlight_Colour = document.getElementById("word_highlight_colour");
    const URL_Highlight_Colour = document.getElementById("url_highlight_colour");
    


        //load all the buttones for main ui
        //const Button_HTML = document.getElementById("run_getHTML");
        const Button_Highlight = document.getElementById("run_highlighter");
        //const Button_Scraper = document.getElementById("run_scraper");
        const Status = document.getElementById("status");
        let tabID = null;

        const Settings_Button = document.getElementById("settings_button");
        const Settings_Section = document.getElementById("settings_section");

        const Security_Button = document.getElementById("security_button");
        const Security_Section = document.getElementById("security_section");

        const WHOISJSON_API_KEY_Looker = document.getElementById("WHOISJSON_API_KEY_Looker");
        const Virus_Total_API_KEY_Looker = document.getElementById("Virus_Total_API_KEY_Looker");
        const WHOIS_USER_Looker = document.getElementById("WHOIS_USER_Looker");



        //inside settings section data laoded
        const Run_On_Open = document.getElementById("run_on_open");
        //const Sheet_ID = document.getElementById("sheetId");
        //const Sheet_Name = document.getElementById("sheet_name");
        //const Emails_Recorded = document.getElementById("emails_recorded");
        //const Clear_Sheet = document.getElementById("clear_sheet");
        //const Time_Range = document.getElementById("time_range");

        const Highlight_On_Open = document.getElementById("highlight_on_open");
        
        const Use_AI = document.getElementById("use_ai");
        const Use_Hussar_API = document.getElementById("use_hussar_api");
        const Use_WHOIS_API = document.getElementById("use_whois_api");
        const Use_Virus_Total_API = document.getElementById("use_virustotal_api");
        const Use_Language_Processing = document.getElementById("use_language_processing");


        // test section data loaded
        //const URL_Input = document.getElementById("URL_input");
        //const URL_Check_Button = document.getElementById("URL_check_button");
        //const Test_Section = document.getElementById("test_section");

        const WHOISJSON_API_KEY = document.getElementById("WHOISJSON_API_KEY");
        const WHOISJSON_API_KEY_Button = document.getElementById("WHOISJSON_API_KEY_button");
        const Virus_Total_API_KEY = document.getElementById("Virus_Total_API_KEY");
        const Virus_Total_API_KEY_Button = document.getElementById("Virus_Total_API_KEY_button");

        const WHOIS_USER = document.getElementById("WHOIS_USER");
        const WHOIS_USER_Button = document.getElementById("WHOIS_USER_button");




    // change status color function
    //------------------------------------------------------------------
    //this function will change the color of the status element based on the text content
    //------------------------------------------------------------------


    const Change_Status_Text = (Element_ID,state) => {
        if (!Element_ID || !state) {
            return;
        }

        const Element = document.getElementById(Element_ID);
        if (!Element) {
            return;
        }
        Element.textContent = state;
        Change_Status_Color(Element,state);
    }

    const Change_Status_Color = (Element) => {
        if (!Element) {
            return;
        }

        const state = Element.textContent.trim().toLowerCase();
        Element.classList.remove("status-online", "status-offline");


        if (state == "online") {
            Element.classList.add("status-online");
            return;
        }

        if (state == "offline") {
            Element.classList.add("status-offline");
            return;
        }

    };


    


    //settings cookies  contorleer
    //------------------------------------------------------------------
    //settings cookies will be used to store the settings for the extension
    //------------------------------------------------------------------

    const Save_Settings = () => {


        let Settings_Cookie = {};
        Settings_Cookie = {
            Highlight_On_Open: Highlight_On_Open.checked,
            Use_AI: Use_AI.checked,
            Use_Hussar_API: Use_Hussar_API.checked,
            Use_WHOIS_API: Use_WHOIS_API.checked,
            Use_Virus_Total_API: Use_Virus_Total_API.checked,
            Warning_Message_Size: Warning_Message_Size.value,
            Word_Highlight_Colour: Word_Highlight_Colour.value,
            URL_Highlight_Colour: URL_Highlight_Colour.value,
        }


        if (!'No whois api key please enter a valid value'.includes(WHOISJSON_API_KEY.value) || !'API Key failed to load'.includes(WHOISJSON_API_KEY.value)) {
            Settings_Cookie.WHOISJSON_API_KEY = WHOISJSON_API_KEY.value;

        }
        else {
            console.log("Who is key is not new input");
        }

        if (!'No virus total api key please enter a valid value'.includes(Virus_Total_API_KEY.value) || !'API Key failed to load'.includes(Virus_Total_API_KEY.value)) {
            Settings_Cookie.Virus_Total_API_KEY = Virus_Total_API_KEY.value;
    
        }
        else {
            console.log("Virus total key is not new input");
        }
        if (!'No user please enter a valid value'.includes(WHOIS_USER.value) || !'API Key failed to load'.includes(WHOIS_USER.value)) {
            Settings_Cookie.WHOIS_USER = WHOIS_USER.value;
            

        }
        else {
            console.log("WHOIS user is not new input");
        }

        

        
        
        try {
            chrome.storage.sync.set(Settings_Cookie);
            console.log("Settings saved");
        }
        catch (error) {
            console.error("Error saving settings:", error);
            return;
        }
    }

    const Load_Settings = () => {
        chrome.storage.sync.get((Cookie_Data) => {
            console.log("Settings loaded:", Cookie_Data);
            //Sheet_ID.value = Cookie_Data.Sheet_ID || "";
            //Sheet_Name.value = Cookie_Data.Sheet_Name || "";
            //Emails_Recorded.value = Cookie_Data.Emails_Recorded || 20;
            //Clear_Sheet.checked = Cookie_Data.Clear_Sheet || false;
            //Time_Range.value = Cookie_Data.Time_Range || "7";

            console.log("BEFORE " + Cookie_Data.Warning_Message_Size);
            console.log("BEFORE " + Cookie_Data.Word_Highlight_Colour);
            console.log("BEFORE " + Cookie_Data.URL_Highlight_Colour);

            Highlight_On_Open.checked = Cookie_Data.Highlight_On_Open || false;
            Use_AI.checked = Cookie_Data.Use_AI || false;
            Use_Hussar_API.checked = Cookie_Data.Use_Hussar_API || false;
            Use_WHOIS_API.checked = Cookie_Data.Use_WHOIS_API || false;
            Use_Virus_Total_API.checked = Cookie_Data.Use_Virus_Total_API || false;
            Warning_Message_Size.value = Cookie_Data.Warning_Message_Size || 15;
            Word_Highlight_Colour.value = Cookie_Data.Word_Highlight_Colour || "#8b0000";
            URL_Highlight_Colour.value = Cookie_Data.URL_Highlight_Colour || "#ff00ea";
            
            console.log("AFTER " + Warning_Message_Size.value);
            console.log("AFTER " + Word_Highlight_Colour.value);
            console.log("AFTER " + URL_Highlight_Colour.value);
            document.getElementById("warning_size_label").textContent = Warning_Message_Size.value;

            if (Cookie_Data.WHOIS_USER != null && Cookie_Data.WHOIS_USER != '') {
                WHOIS_USER.value = 'API User Loaded Successfully';
            }
            else {
                WHOIS_USER.value = 'No user please enter a valid value';
            }
            
            if (Cookie_Data.WHOISJSON_API_KEY != null && Cookie_Data.WHOISJSON_API_KEY != '') {
                WHOISJSON_API_KEY.value = 'API Key Loaded Successfully';
            }
            else {
                WHOISJSON_API_KEY.value = 'No whois api key please enter a valid value';
            }
            
            if (Cookie_Data.Virus_Total_API_KEY != null && Cookie_Data.Virus_Total_API_KEY != '') {
                Virus_Total_API_KEY.value = 'API Key Loaded Successfully';
            }
            else {
                Virus_Total_API_KEY.value = 'No virus total api key please enter a valid value';
            }

        });
    }

    
    const API_Controller = (Choice) => {
        const Selection = [
            { key: "WHOISJSON_API_KEY", element: WHOISJSON_API_KEY },
            { key: "Virus_Total_API_KEY", element: Virus_Total_API_KEY },
            { key: "WHOIS_USER", element: WHOIS_USER }
        ];

        chrome.storage.sync.get((Cookie_Data) => {
            const item = Selection[Choice];
            const cookieValue = Cookie_Data[item.key];
            const currentVal = item.element.value;

            // If a value is saved in storage, display it, otherwise set status messages
            if (cookieValue != null && cookieValue !== "") {
                if (
                    currentVal === 'API Key Loaded Successfully' ||
                    currentVal === 'API Key failed to load' ||
                    currentVal === 'Please enter a valid Value'
                ) {
                    
                    if (currentVal !== cookieValue) {
                        item.element.value = cookieValue;
                    }
                } else if (currentVal === cookieValue) {
                    item.element.value = 'API Key Loaded Successfully';
                } else {
                    // Some other value (user input, etc.), set to status
                    item.element.value = 'API Key Loaded Successfully';
                }
            } else {
                // Key not found: show tailored message per type
                if (item.key === "WHOIS_USER") {
                    item.element.value = 'No user please enter a valid value';
                } else if (item.key === "WHOISJSON_API_KEY") {
                    item.element.value = 'No whois api key please enter a valid value';
                } else if (item.key === "Virus_Total_API_KEY") {
                    item.element.value = 'No virus total api key please enter a valid value';
                } else {
                    item.element.value = 'API Key failed to load';
                }
            }
        });
    };

    const Who_is_API_Controller = () => {
        chrome.storage.sync.get((Cookie_Data) => {
            if ((WHOISJSON_API_KEY.value == 'API Key Loaded Successfully' || WHOISJSON_API_KEY.value == 'API Key failed to load') && WHOISJSON_API_KEY.value != Cookie_Data.WHOISJSON_API_KEY) {
                if (Cookie_Data.WHOISJSON_API_KEY != null && Cookie_Data.WHOISJSON_API_KEY != '') {
                    console.log("WHOISJSON_API_KEY is loaded from cookies:", Cookie_Data.WHOISJSON_API_KEY);
                    WHOISJSON_API_KEY.value = Cookie_Data.WHOISJSON_API_KEY; //show the key
                }
                else {
                    console.log("WHOISJSON_API_KEY is not loaded from cookies:");
                    WHOISJSON_API_KEY.value = 'API Key failed to load'; //something gone badly wrong
                }
                
            }
            else if ((WHOISJSON_API_KEY.value != 'API Key Loaded Successfully' || WHOISJSON_API_KEY.value !== 'API Key failed to load') && WHOISJSON_API_KEY.value == Cookie_Data.WHOISJSON_API_KEY) {
                if (Cookie_Data.WHOISJSON_API_KEY != null && Cookie_Data.WHOISJSON_API_KEY != '') {
                    WHOISJSON_API_KEY.value = 'API Key Loaded Successfully'; //show the key
                }
                else {
                    WHOISJSON_API_KEY.value = 'API Key failed to load'; //something gone badly wrong
                }
            }
            else {

                WHOISJSON_API_KEY.value = 'API Key failed to load'; //something gone badly wrong
            }

        });
    }

    const Virus_Total_API_Controller = () => {
        chrome.storage.sync.get((Cookie_Data) => {
            if ((Virus_Total_API_KEY.value == 'API Key Loaded Successfully' || Virus_Total_API_KEY.value == 'API Key failed to load') && Virus_Total_API_KEY.value != Cookie_Data.Virus_Total_API_KEY) {
                if (Cookie_Data.Virus_Total_API_KEY != null && Cookie_Data.Virus_Total_API_KEY != '') {
                    console.log("Virus_Total_API_KEY is loaded from cookies:", Cookie_Data.Virus_Total_API_KEY);
                    Virus_Total_API_KEY.value = Cookie_Data.Virus_Total_API_KEY; //show the key
                }
                else {
                    console.log("Virus_Total_API_KEY is not loaded from cookies:");
                    Virus_Total_API_KEY.value = 'API Key failed to load'; //something gone badly wrong
                }
                
            }
            else if ((Virus_Total_API_KEY.value != 'API Key Loaded Successfully' || Virus_Total_API_KEY.value !== 'API Key failed to load') && Virus_Total_API_KEY.value == Cookie_Data.Virus_Total_API_KEY) {
                if (Cookie_Data.Virus_Total_API_KEY != null && Cookie_Data.Virus_Total_API_KEY != '') {
                    Virus_Total_API_KEY.value = 'API Key Loaded Successfully'; //show the key
                }
                else {
                    Virus_Total_API_KEY.value = 'API Key failed to load'; //something gone badly wrong
                }
            }
            else {

                Virus_Total_API_KEY.value = 'API Key failed to load'; //something gone badly wrong
            }

        });
    }


    //run on start checkbox contorleer
    //------------------------------------------------------------------
    //run on open checkbox will run the extension open  of gmail email
    //------------------------------------------------------------------



   
    if (!Highlight_On_Open) {
        console.warn("Highlight on open checkbox not found!");
    }
    else{
        console.log("Highlight on open checkbox found");
    }



    //settings UI contorleer
    //------------------------------------------------------------------
    //in the future simplify this section as you use the same code innit
    //------------------------------------------------------------------
    

    if (!Settings_Button || !Settings_Section) { //if settings button or section not found, exit
        console.error("Settings button or section not found!");
        return;
    }
    else{
        console.log("Settings button and section found");
    }
    const Settings_Expander = () => { //function to toggle the settings section visibility
        console.log("Settings button clicked");
        const SS_Hidden_Status = Settings_Section.classList.toggle("settings-section-hidden"); //get the state of the settings section
        const SS_Hidden_Status_Other = Security_Section.classList.contains("security-section-hidden");

        if (SS_Hidden_Status){ 
            console.log("Settings Closed");
            Settings_Section.setAttribute("aria-hidden", String(SS_Hidden_Status));  
            Settings_Button.setAttribute("aria-expanded", String(!SS_Hidden_Status));  
        }
        else{
            if (!SS_Hidden_Status_Other){  //other section currently visible
                console.log("Security section is showing now it will be hidden");
                Security_Section.classList.add("security-section-hidden");
                Security_Section.setAttribute("aria-hidden", "true");  
                Security_Button.setAttribute("aria-expanded", "false");  
            }
            console.log("Settings Opened");
            Settings_Section.setAttribute("aria-hidden", String(!SS_Hidden_Status));  
            Settings_Button.setAttribute("aria-expanded", String(SS_Hidden_Status));  
        }
        
           
    };
    
    //security UI contorleer
    
    if (!Security_Button || !Security_Section) { //if security button or section not found, exit
        console.error("Security button or section not found!");
        return;
    }
    else{
        console.log("Security button and section found");
    }
    
    const Security_Expander = () => { //function to toggle the security section visibility
        console.log("Security button clicked");
        const SS_Hidden_Status = Security_Section.classList.toggle("security-section-hidden"); //get the state of the security section
        const SS_Hidden_Status_Other = Settings_Section.classList.contains("settings-section-hidden");
       
        if (SS_Hidden_Status){ //if settings section is hidden, set it to visible
            console.log("Security Closed");
            Security_Section.setAttribute("aria-hidden", String(SS_Hidden_Status));  
            Security_Button.setAttribute("aria-expanded", String(!SS_Hidden_Status));  
        }
        else{
            if (!SS_Hidden_Status_Other){  //other section currently visible
                console.log("Settings section is showing now it will be hidden");
                Settings_Section.classList.add("settings-section-hidden");
                Settings_Section.setAttribute("aria-hidden", "true");  
                Settings_Button.setAttribute("aria-expanded", "false");  
            }
            console.log("Security Opened");
            Security_Section.setAttribute("aria-hidden", String(!SS_Hidden_Status));  
            Security_Button.setAttribute("aria-expanded", String(SS_Hidden_Status)); 

        }
       

    };
   
    

    /*const Foward_URL = () => {
        if (!URL_Input.value) 
        {
            Update_Status("Please enter a URL", true, true);
            return;
        }
        else 
        {
            Update_Status("URL: " + URL_Input.value, true, true);
            try {
                console.log("Sending URL to Check_URL " + URL_Input.value);
                Check_URL(URL_Input.value, WHOISJSON_API_KEY.value , Virus_Total_API_KEY.value); //send the API key to the Check_URL function

            }
            catch (error) {
                console.error("Check_URL is not available error:" +error);
                Update_Status("URL checker not loaded", true, true);
                return;
            }
        }
    };*/

    //buttons contorleer
    if (!Button_Highlight || !Status) {
        console.error("Button or Status not found!");
        return;  //if ui not loaded dont do anything
    };
    console.log("Buttons loaded and status Loaded");

    let intejected_tabs = [];

    //use consts function to update the status
    const Update_Status = (status_text, console_log = true,status_box = true) => {
       if(status_box){
        Status.textContent = status_text;
       }
        if (console_log) {
            console.log(status_text);
        }
    }

    
   
    const Inject_Script = (tabID) => { //function to inject the scripts into the tab
        return new Promise((resolve) => {
            chrome.scripting.executeScript({
                target: { tabId: tabID },
                files: ["Bad_Words_List.js","Warnings_List.js","check_url.js","highlight_words.js",]
            },
            ()=> {
                if (chrome.runtime.lastError) {  //arrow function to check for errors
                    console.error("Error injecting scripts:", chrome.runtime.lastError);
                    Update_Status("Error injecting scripts");
                    resolve(null);
                }
                else {
                    const injected_status=Track_Injected_Tabs(tabID); //track the injected tabs
                    Update_Status("Scripts injected successfully");
                    resolve(injected_status);
                }
            });
        });
    }

    const Track_Injected_Tabs = (tabID) => { //function to track the injected tabs and inject the script if not injected
        if (tabID !== null) {
            
            if(intejected_tabs.includes(tabID)){ //if the tab is already injected, exit
                Update_Status("Tab already injected, exiting", true);
                return 1;
            }
            else if(!intejected_tabs.includes(tabID)){ //if the tab is not injected, inject it
                intejected_tabs.push(tabID);
                Update_Status( "Tab injected successfully", true);
                return 2;
            }
            else{
                Update_Status("Error injecting scripts", true);
                return 3;
            }
        }
        else {
            Update_Status("No tab found", true);
            return null;
        }
    }

    

    const Get_Tab_ID = () => {
        return new Promise(resolve => {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                if (tabs.length > 0 && tabs[0].url.startsWith("https://mail.google.com/")) {
                    Update_Status("Google tab found", true);
                    resolve(tabs[0].id);
                } else {
                    Update_Status("No active Gmail tab found navigate to gmail and try again", true);
                    resolve(null);
                }
            });
        });
    }

    const Send_Message = async (message) => {
        const TAB_ID = tabID ?? await Get_Tab_ID();
        if(TAB_ID != null){
            chrome.tabs.sendMessage(TAB_ID, { action: message }, (response  ) => {
                console.log("Message sent to tab:", message);
                Update_Status(response);
                
                if (chrome.runtime.lastError) {
                    console.error("Error sending message:", chrome.runtime.lastError);
                    Update_Status("Error sending message: " + chrome.runtime.lastError.message, true, true);
                    return;
                }
                else {
                    Update_Status("Message sent successfully", true, false);
                    return;
                }
            });
        }
        else {
            Update_Status("No tab found navigate to gmail and try again", true);
            return;
        }
    }

    const API_Status_Updater = async () => {
        let WHOISJSON_API_KEY = '';
        let Virus_Total_API_KEY = '';
        let WHOIS_USER = '';
        chrome.storage.sync.get((Cookie_Data) => {
            console.log("Cookie data:", Cookie_Data);
            WHOISJSON_API_KEY = Cookie_Data.WHOISJSON_API_KEY;
            Virus_Total_API_KEY = Cookie_Data.Virus_Total_API_KEY;
            WHOIS_USER = Cookie_Data.WHOIS_USER;

        });
        console.log("API status updater started");
        const Hussar_Status= await chrome.runtime.sendMessage({action: "Alive_Hussar_API"});
        console.log("Hussar status:", Hussar_Status);
        if (Hussar_Status === true) {
            Update_Status("Hussar API is Online", true, true);
            Change_Status_Text("Hussar_API_Status", "Online");

        }
        else {
            Update_Status("Hussar API is Offline", true, true);
            Change_Status_Text("Hussar_API_Status", "Offline");
        }

        const Virus_Total_Status= await chrome.runtime.sendMessage({action: "Alive_VirusTotal_API", API_Key: Virus_Total_API_KEY});
        console.log("Virus Total status:", Virus_Total_Status);
        if (Virus_Total_Status === true) {
            Update_Status("Virus Total API is Online", true, true);
            Change_Status_Text("Virus_Total_API_Status", "Online");
        }
        else {
            Update_Status("Virus Total API is Offline", true, true);
            Change_Status_Text("Virus_Total_API_Status", "Offline");
        }



        const endpoint = `https://jsonwhoisapi.com/api/v1/whois?identifier=google.com`;
        const new_key = `${WHOIS_USER}:${WHOISJSON_API_KEY}`;
        try{
            const response = await fetch(endpoint, {
            method: "GET",
            headers: {
                "Authorization": `Basic ${btoa(new_key)}`,
                "Accept": "application/json"
            }
            });
            if (!response.ok) {
                throw new Error(`jsonwhoisapi.com request failed (${response.status} ${response.statusText})`);
            }
            else{
                Update_Status("WHOIS JSON API is Online", true, true);
                Change_Status_Text("WHOIS_API_Status", "Online");
            }
        }
        catch (error) {
            Update_Status("WHOIS JSON API is Offline", true, true);
            Change_Status_Text("WHOIS_API_Status", "Offline");
        }

        Update_Status("All API's checked Ready for Action", true, true);

        

        


        /*
        const endpoint = 'https://whoisjson.com/api/v1/domain-availability?domain=google.com';
        console.log("WHOIS JSON API key in API status updater:", WHOISJSON_API_KEY);
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Authorization': `TOKEN=${WHOISJSON_API_KEY}`
            }
        });
        console.log("WHOIS JSON API response:", response);

        if (!response.ok) {
            Update_Status("WHOIS JSON API is Offline", true, true);
            Change_Status_Text("WHOIS_API_Status", "Offline");
            throw new Error(`WhoisJSON request failed (${response.status} ${response.statusText})`);
        }
        else {
            Update_Status("WHOIS JSON API is Online", true, true);
            Change_Status_Text("WHOIS_API_Status", "Online");
        }
            */
    };

    const MAIN = async () => {
        console.log("API status updated");
        await API_Status_Updater();
        

        tabID = await Get_Tab_ID();
        if (tabID == null){
            Update_Status("No tab found navigate to gmail and try again", true,true);
            return null;
        }
        if (intejected_tabs.includes(tabID)) { //tab already injected no need to reinject
            Update_Status("Tab already injected, exiting", true, true);
            return tabID;
        }
        let attempts = 0;
        let injected = null;
        try {
            while (!injected && attempts < 10) {
                attempts++;
                Update_Status(`Injecting scripts... (attempt ${attempts})`, true, false);
                injected = await Inject_Script(tabID); //wait for chrome to finish injecting before next attempt
            }

            if (injected) {
                Update_Status("Tab injected successfully", true, true);
                
                return tabID;
            }

            Update_Status("Error injecting scripts 10 attempts", true, true);
            return null;
        } 
        catch (error) {
            console.error("MAIN injection error:", error);
            Update_Status("Error injecting scripts", true, true);
            return null;
        }

    }

    //all the evnet listeners for the buttons and settings
    //------------------------------------------------------------------
    //These guys do the listenting
    //------------------------------------------------------------------

    /*
    Button_HTML.addEventListener("click", () => {
        Update_Status("<MAIN> Initiating...", true,true);
        MAIN(); //inject the scripts into the tab
    });*/
    Button_Highlight.addEventListener("click", async () => {
        Update_Status("Highlight Initiating...",true,true);
        await MAIN(); //inject the scripts into the tab
        console.log("Tab ID: ", tabID);
        if(tabID != null){
            Update_Status("Begining Highlighting Process", true, true);
            await Send_Message("highlight");
            Update_Status("Highlighting Process Completed", true, true);
        } else {
            Update_Status("Unable to send highlight command", true, true);
        }
        Update_Status("Process Completed \n Ready for Action", true, true);
        return;
    });
    /*
    Button_Scraper.addEventListener("click", () => {
        Update_Status("Scraper Initiating...",true,true);
        MAIN(); //inject the scripts into the tab
    });*/
    
    Settings_Button.addEventListener("click", Settings_Expander); //add event listener to the settings button (little cog)
    Security_Button.addEventListener("click", Security_Expander); //add event listener to the security button (little shield)
    
    //URL_Check_Button.addEventListener("click", Foward_URL);



    //Sheet_ID.addEventListener("input", Save_Settings);
    //Sheet_Name.addEventListener("input", Save_Settings);
    //Clear_Sheet.addEventListener("change", Save_Settings);
    //Time_Range.addEventListener("change", Save_Settings);
    Highlight_On_Open.addEventListener("change", Save_Settings);
    Use_AI.addEventListener("change", Save_Settings);
    Use_Hussar_API.addEventListener("change", Save_Settings);
    Use_WHOIS_API.addEventListener("change", Save_Settings);
    Use_Virus_Total_API.addEventListener("change", Save_Settings);
    
    
    
    WHOISJSON_API_KEY_Button.addEventListener("click", Save_Settings);
    Virus_Total_API_KEY_Button.addEventListener("click", Save_Settings);
    WHOIS_USER_Button.addEventListener("click", Save_Settings);

    

    Virus_Total_API_KEY_Looker.addEventListener("click", () => API_Controller(1));
    WHOISJSON_API_KEY_Looker.addEventListener("click", () => API_Controller(0));
    WHOIS_USER_Looker.addEventListener("click", () => API_Controller(2));


    Warning_Message_Size.addEventListener("change", Save_Settings);
    Warning_Message_Size.addEventListener("input", () => {
        document.getElementById("warning_size_label").textContent = Warning_Message_Size.value;
    });

    Word_Highlight_Colour.addEventListener("change", Save_Settings);
    URL_Highlight_Colour.addEventListener("change", Save_Settings);
    
    console.log("Buttons and status loaded and event listeners added");
    Update_Status("--READY FOR ACTION--", true, true);

    Load_Settings();
    console.log("Settings loaded");
    console.log("WHOIS JSON API key after loading settings:", WHOISJSON_API_KEY.value);
    
    try {
        console.log("Updating API status");
        await API_Status_Updater();
    }
    catch (error) {
        console.error("Error updating API status:", error);
        Update_Status("Error updating API status", true, true);
    }
    //setInterval(API_Status_Updater, 60000); //update the API status every 60 seconds

    
});




