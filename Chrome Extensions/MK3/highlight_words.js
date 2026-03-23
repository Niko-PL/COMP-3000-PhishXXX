if (!window.PhishHussar_Highlight_Words_Loaded) { //only run once to prevent errors on re-runs
window.PhishHussar_Highlight_Words_Loaded = true;
//this is the script that highlights the words in the email body



const Bad_Words = (typeof window !== "undefined" && window.BAD_WORDS) || [];
const Warnings = (typeof window !== "undefined" && window.Warnings_Mini_DB) || [];
const Warnings_BACKUP = "Potential Phishing please be careful and verify Sender and Contents (no reason identified)";
let Warnings_Current = Warnings_BACKUP; //global variable for current warning message
const BAD_WORDS_Class = "PhishHussar-highlighted-word";
const Style_Name = "PhishHussar-highlight-css-1"; //style name to inject (unique to avoid conflicts)
const WARNING_CLASS = "PhishHussar-warning-message";

const URL_CLASS = "PhishHussar-highlighted-url";

let Warning_Message_Div = null; //global variable for warning message user is hovering over

let Alive_Hussar_API_Status = false;

console.log("Bad Words:", Bad_Words);
console.log("Warnings:", Warnings);

Identify_Hovering_Word = (message,event) => {
    if (!message || !event || !event.target) {
        return;
    }
    console.log("Identify_Hovering_Word", message, event);
    
}

Display_Warning_Message = (warning_message) => {
    if (Warning_Message_Div && document.body.contains(Warning_Message_Div)) {
        Warning_Message_Div.textContent = warning_message; // update text when reusing
        return Warning_Message_Div;
    }
    else {
        Warning_Message_Div = document.createElement("div");
        Warning_Message_Div.id = (WARNING_CLASS); //get the css related to the warning message
        Warning_Message_Div.className = WARNING_CLASS;
        Warning_Message_Div.textContent = warning_message;
        document.body.appendChild(Warning_Message_Div);
        return Warning_Message_Div;
    }

}

Get_Warning_Message = (id) => {
    console.log("Get_Warning_Message with id: ", id);
    console.log("Get_Warning_Message Warnings are : ", Warnings);
    if (Object.keys(Warnings).length > 0 && Warnings[id] != null) { //if warnings are found return the warning message
        console.log("Get_Warning_Message found warning: ", Warnings[id]);
        Warnings_Current = Warnings[id];
        return Warnings_Current;
    }
    else { //if no warnings are found return the backup message
        console.log("Get_Warning_Message no warnings found returning backup message");
        return Warnings_Current = Warnings_BACKUP;
    }
}

Show_Warning_Message = (message) => {
    //console.log("Show_Warning_Message Target", message.currentTarget);
    //console.log("Show_Warning_Message Location", message.screenX, message.screenY);

    let Dispaly_Message_Div = null;

    if (message.currentTarget.getAttribute("warning_id") != null) {
        try{
            //console.warn("Show_Warning_Message for warning_id :", Get_Warning_Message(message.currentTarget.getAttribute("warning_id")));
            Dispaly_Message_Div = Display_Warning_Message(Get_Warning_Message(message.currentTarget.getAttribute("warning_id"))); //get the warning message div
        }
        catch (error) {
            console.error("Error showing warning message:", error);
            Dispaly_Message_Div = "Calculation Error Please Verify Yourself";
        }
    }
    if (message.currentTarget.getAttribute("data-risk") != null) {
        try{
            //console.warn("Show_Warning_Message  for data-risk  :", message.currentTarget.getAttribute("data-risk"));
            Dispaly_Message_Div = Display_Warning_Message("This Links Risk is analysed to be:  " + message.currentTarget.getAttribute("data-risk") + "/5"); //get the warning message div
        }
        catch (error) {
            console.error("Error showing data-risk message:", error);
            Dispaly_Message_Div = "Calculation Error Please Verify Yourself";
        }
    }
    
    if (Warning_Message_Div != null && !Warning_Message_Div.classList.contains("visible")) { //if you cant see it then add it
        Warning_Message_Div.classList.add("visible");
    }

}


Hide_Warning_Message = () => {
    //console.log("Hide_Warning_Message");
    if (Warning_Message_Div != null && Warning_Message_Div.classList.contains("visible")) { //if you can see it then remove it
        Warning_Message_Div.classList.remove("visible");
    }
}

Hover_Warning_Message = (event) => { //only update location of warning message
    //console.log("Hover_Warning_Message Target", event.currentTarget);
    //console.log("Hover_Warning_Message Location", event.clientX, event.clientY);
    const X_Location = event.clientX + 15 + "px";
    const Y_Location = event.clientY + 5 + "px";
    //console.log("Hover_Warning_Message X_Location", X_Location);
    //console.log("Hover_Warning_Message Y_Location", Y_Location);
    Warning_Message_Div.style.left = X_Location;
    Warning_Message_Div.style.top = Y_Location;
}

Attach_Warning_Message_Event_Listeners = (rootNode) => {
    if (!rootNode || rootNode.nodeType !== Node.ELEMENT_NODE) {
        console.log("Attach_Warning_Message_Event_Listeners: skipping non-element root", rootNode);
        return;
    }
    //console.log("Attach_Warning_Message_Event_Listeners: rootNode", rootNode);

    let Highlighted_Words = rootNode.querySelectorAll(`.${BAD_WORDS_Class}`);

    
    Highlighted_Words.forEach(node => {
        if (node.dataset.Listner_Active == true) {
            return;
        }
        //console.log("Attaching event listeners to node:", node);
        node.addEventListener("mouseenter",Show_Warning_Message);
        node.addEventListener("mousemove",Hover_Warning_Message);
        node.addEventListener("mouseleave",Hide_Warning_Message);
        node.dataset.Listner_Active = true;
    });
}


Word_Regex = async (email) => {
    let Bad_Words_Regex = [];
    console.warn("Word_Regex: Email words list:", email);
    console.warn("Word_Regex: Sending message to background worker");

    const result = await chrome.runtime.sendMessage({action: "URL-API-Background-3", email_words_list: email});
    console.warn("URL API test data:", result);
    if (result.error) {  
        console.error("Error during fetch operation:", result.error);
        return null;
    }
    try {
        Bad_Words_Regex = [...new Set(result.bad_words)].filter(Boolean);
    }
    catch (error) {
        console.error("Error creating word regex:", error);
        return null;
    }
    if (Bad_Words_Regex.length < 0 || Bad_Words_Regex == null) {
        console.error("No bad words found");
        return null;
    }

    const ESCAPED_REGEX = Bad_Words_Regex.map(w => w.replace(/[.*+?^${}()|[\]\\]/gi, "\\$&")).join("|"); // Escaped REGEX chars

    New_Regex = new RegExp(`\\b(${ESCAPED_REGEX})\\b`, "gi");
    console.log("New Regex:", New_Regex);  //TEST remove this (boi gonna be long)
    return New_Regex;

};

Highlight_Words = (body,regex) => { //body == Email_Body <.a3s> 
    if (!regex || !body || body.length === 0 || regex == null) {
        console.log("Lack of regex or body or body is empty or regex is null");
        return;
    }

    const roots = (body instanceof NodeList || Array.isArray(body))
        ? Array.from(body) //convert to array if it is a NodeList or Array
        : (body ? [body] : []); //convert to array if it is a single node

    if (roots.length === 0) { //if no roots are found return
        console.log("Highlight_Words: no body nodes supplied");
        return;
    }

    //revisit this can be made simple
    roots.forEach(rootNode => {
        if (!(rootNode instanceof Node)) {
            console.log("Highlight_Words: skipping non-node root", rootNode);
            return;
        }

        const Tree_Walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT, { acceptNode: (node) => {
            
            if (!node.parentNode || !node.textContent?.trim()){  //if no parent or empty reject
                return NodeFilter.FILTER_REJECT; //returns to Tree_Walker
            }
            else if (node.parentNode.closest(`.${BAD_WORDS_Class}`)){ //if the parent node is a child of the BAD_WORDS_Class, reject the node
                return NodeFilter.FILTER_REJECT;
            }
            else {
                return NodeFilter.FILTER_ACCEPT;
            }
            
        }});
        
        let Tree_Temp_Nodes = [];  //temporary array to store the nodes mid traversal
        let COUNT_BAD_WORDS = 0;

        while (Tree_Walker.nextNode()){  // traverse the tree if next carry on 
            Tree_Temp_Nodes.push(Tree_Walker.currentNode);
        }
        //now we inject our css over the bad words identified
        Tree_Temp_Nodes.forEach(node => {
            if (!node || !node.textContent) {
                return;
            }

            const Orignial_Text = node.textContent;
            const New_Text = Orignial_Text.replace(regex, match => {
                COUNT_BAD_WORDS++;
                const id = 1
                return `<span class="${BAD_WORDS_Class}" warning_id="${id}">${match}</span>`;
            });

            if (New_Text !== Orignial_Text) { //make sure we modified the text html
                
                const Temp_Container = document.createElement("span");
                Temp_Container.innerHTML = New_Text;
                const Doc_Fragment = document.createDocumentFragment();
                while (Temp_Container.firstChild) {
                    Doc_Fragment.appendChild(Temp_Container.firstChild);
                }
                node.replaceWith(Doc_Fragment);

                
            }
        });
        Attach_Warning_Message_Event_Listeners(rootNode);
    });
}

 Highlight_Url_HREF = async (body, Use_Hussar_API, Use_WHOIS_API, Use_Virus_Total_API) => {
    //console.warn("Highlight_Url_HREF: body", body);
    if (!body || body.length === 0 || body == null) {
        console.log("Highlight_Url_HREF: no body supplied");
        return;
    }

    const roots = (body instanceof NodeList)
        ? Array.from(body)
        : (body ? [body] : []);

    if (roots.length === 0) {
        console.log("Highlight_Url_HREF: no body nodes supplied");
        return;
    }
    else{
        console.log("THE ROOTS ARE: ", roots);
    }

    for (const rootNode of roots) {
        if (!(rootNode instanceof Node)) {
            console.log("Scan_And_Highlight_Links: skipping non-node root", rootNode);
            continue;
        }

        const URLS = rootNode.querySelectorAll("a[href]");
        
        for (const url of URLS) {
            const link_href = url.getAttribute("href");

            let link_text = url.textContent;
            const link_img = url.querySelector("img");

            if (link_text == `` && link_img != null) {
                console.log("Link text is null but img is present");
                link_text = 'Image//Link//This//is//an//image//link'; //unique text to identify image links
                
            }
            else if (link_text != `` && link_img != null) {
                console.log("img is present and text is not null: ", link_text);

            }
            else if (link_text != `` && link_img == null) {
                console.log("Link text is not null and img is not present");
                console.log("Link text:", link_text);
            }

        
            console.log("Found link from href:", link_href);

            let risk = null;
            if (Use_Hussar_API || Use_WHOIS_API || Use_Virus_Total_API) {
                console.log("Checking URL with API selected");
                console.log("Use_Hussar_API:", Use_Hussar_API);
                console.log("Use_WHOIS_API:", Use_WHOIS_API);
                console.log("Use_Virus_Total_API:", Use_Virus_Total_API);
                risk = await Check_URL(link_href, link_text, Use_Hussar_API, Use_WHOIS_API, Use_Virus_Total_API);
            }
            else {
                console.error("No API selected");
                
            }


            if (risk == null || risk == undefined) {
                console.error("Risk is null");
                return;
            }
            else{
                console.log("Risk:", risk);
            }
            console.log("Risk:", risk);

            url.classList.add(URL_CLASS); //make it pink
            console.log("URL class added");
            url.setAttribute("data-risk", String(risk));
            url.setAttribute("data-url", link_href);
            url.addEventListener("mouseenter",Show_Warning_Message);
            url.addEventListener("mousemove",Hover_Warning_Message);
            url.addEventListener("mouseleave",Hide_Warning_Message);
            Attach_Warning_Message_Event_Listeners(url);
        }
        
    }

}
Inject_CSS = async() => { //inject the css into the head of the document
    const existingStyle = document.getElementById(Style_Name);
    if (existingStyle){
        console.log("Removing existing CSS to apply updated settings");
        existingStyle.remove();
    }

    const Cookie_Data = await new Promise((resolve) => {
        chrome.storage.sync.get(resolve);
    });

    const Warning_Message_Size = Number(Cookie_Data.Warning_Message_Size) || 15;
    const Word_Highlight_Colour = Cookie_Data.Word_Highlight_Colour || "#8b0000";
    const URL_Highlight_Colour = Cookie_Data.URL_Highlight_Colour || "#ff00ea";

    const css = document.createElement('style');
    css.id = Style_Name;
    css.textContent = `
    .${BAD_WORDS_Class} {
    background-color: ${Word_Highlight_Colour};
    color: white;}

    .${WARNING_CLASS} {
    background-color: rgba(0, 0, 0, 0.64); 
    color: rgb(255, 0, 0);
    padding: 2px; 
    border-radius: 2px; 
    margin-top: 2px; 
    margin-bottom: 2px; 
    font-size: ${Warning_Message_Size}px;
    text-align: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    left: 0;
    top: 0; 
    } 

    .${WARNING_CLASS}.visible {
    opacity: 1;}

    .${URL_CLASS} {
    background-color: ${URL_Highlight_Colour}; 
    color: rgb(0, 0, 0);}
    `;

    (document.head || document.documentElement).appendChild(css);
    console.log("CSS injected");
    }

    

}

Clean_Email_Body = (email) => {
    console.log("email in CLean_Email_Body:", email);

    let cleaned_email = [];
    const walker = document.createTreeWalker(email, NodeFilter.SHOW_TEXT, null, false); //create a tree walker 
    let node;
    while (node = walker.nextNode()) {
        const parent = node.parentElement;
        if (!parent.closest('a')) {  // spip links text (HREF)
            cleaned_email.push(node.textContent.trim()); //add the text to the result
        }
    }
    return cleaned_email.filter(Boolean).join(" "); //join the result with a space and send it back
}

Scan_Email = async () => {
    console.log("Highlighting words");

    const Email_Body = document.querySelectorAll(".a3s"); //hmtl <.a3s> for gmail email body
    
    if (Email_Body.length > 0) {
        console.log("Email Body found ");


        const emailBodyString_Text = Array.from(Email_Body).map(email => Clean_Email_Body(email)).join("\n");
    
        console.log("Cleaned Email Body String Text:", emailBodyString_Text);
        const low_cleanedEmailBodyString_Text = emailBodyString_Text.toLowerCase();
        
        try 
        {
            if (Alive_Hussar_API_Status) {
                Highlight_Words(Email_Body, await Word_Regex(low_cleanedEmailBodyString_Text));
            }
            else {
                console.error("Server is not alive");
            }
        }
        catch (error) {
            console.error("Error highlighting words:", error);
            return "Error highlighting words";
        }

        chrome.storage.sync.get((data) => {
            const Use_Hussar_API = data.Use_Hussar_API;
            const Use_WHOIS_API = data.Use_WHOIS_API;
            const Use_Virus_Total_API = data.Use_Virus_Total_API;



            if (Use_Hussar_API || Use_WHOIS_API || Use_Virus_Total_API) {
                Highlight_Url_HREF(Email_Body, Use_Hussar_API, Use_WHOIS_API, Use_Virus_Total_API);
            }
            else {
                console.error("No API selected");
            }
        });
    }
    else {
        console.log("Email Body not found");
        return "No Email found - Open an Email and try again";
    }

}

const MAIN = async () => {
    await Inject_CSS(); //we inject the css for highlt
    const response = await chrome.runtime.sendMessage({action: "Alive_Hussar_API"});
    console.log("Alive_Hussar_API_Status:", response);
    
    if (response === true) {
        console.log("Server is alive 1st point of contact");
        Alive_Hussar_API_Status = true;
    }
    else {
        Alive_Hussar_API_Status = false;
        console.error("Server is not alive 1st point of contact");
    }

    await Scan_Email();

    /*if (window.gmail_loaded){ //if its true then gmail is loaded and highlighted and highlighted words
        return;
    }
    else {
        window.gmail_loaded = true; //set gmail to highlighted and highlighted words
    }*/
};



chrome.runtime.onMessage.addListener((Message, sender, sendResponse) => {
    console.log("Message received:", Message);
    console.log("Sender:", sender);
    if (Message && Message.action === "highlight") {
        console.log("Highlighting words");
        try {
            const status = MAIN();
            sendResponse({ status: status || "Highlighting completed" });
        }
        catch (error) {
            console.error("Highlight error:", error);
            sendResponse({ status: "Highlighting failed - see console" });
        }
    } else {
        sendResponse({ status: "No action executed" });
    }
    return false; //we respond synchronously so no need to keep the port open
});
