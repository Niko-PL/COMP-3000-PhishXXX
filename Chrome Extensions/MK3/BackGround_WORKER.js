// this script is used to bypass the CORS policy of the Virus Total API
// as the CORS policy blocks it running in Check_url ffs
// should be a background worker and apear in extention as so (liitle red)

const DEFAULT_API_URL = "https://localhost:5443";


const Test_Hussar_API = async () => {
  
  try {
  const response = await fetch(DEFAULT_API_URL + "/test");
    const data = await response.json();

    return data;
  }
  catch (error) {
    console.error("Error during fetch operation:", error);
    return {error: "Error during fetch operation"};
  }
}


const Alive_Hussar_API = async () => {
  try {
    const response = await fetch(DEFAULT_API_URL + "/test", { method: "GET" });
    return response;
  } catch (error) {
    console.error("Server ping failed:", error);
    return "HELLO FROM BACKGROUND WORKER";
  }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => { //run on message received

    console.log("Message received:", message);
    console.log("Sender:", sender);

    (async () => {
        if (message.action === "VT-Background-1") {
            console.log("Virus Total domain reputation requested");
            const url = message.url;
            const API_Key = message.API_Key;
            const options = {
                method: 'POST',
                headers: {
                  accept: 'application/json',
                  'x-apikey': API_Key,
                  'content-type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({url: url})
              };

            const options_2 = {
                method: 'GET',
                headers: {
                    'x-apikey': API_Key,
                    accept: 'application/json'
                }
                };
                  

              fetch('https://www.virustotal.com/api/v3/urls', options)
              .then(response => response.json())
              .then(response => {
                const response_id = response.data.id;
                fetch(`https://www.virustotal.com/api/v3/analyses/${response_id}`, options_2)
                .then(res => res.json())
                .then(res => sendResponse(res))
                .catch(err => console.error(err));


              })
              .catch(err => console.error(err));



              
              
            
            
           
            const URL_Analysis_Data = await URL_Analysis.json();
            //const Failures = URL_Analysis_Data.stats.failure;
            //const Harmless = URL_Analysis_Data.stats.harmless;
            //const Malicious = URL_Analysis_Data.stats.malicious;
            //const Suspicious = URL_Analysis_Data.stats.suspicious;
            

      
        
        }

        if (message.action === "URL-API-Background-1") {
          console.log("URL API requested");
          const url = message.url;
          const enpoint = (DEFAULT_API_URL + "/extend", { short_url: url });
          try {
          const response = await fetch(enpoint);
          const data = await response.json();

          sendResponse(data);
          }
          catch (error) {
            console.error("Error during fetch operation:", error);
            sendResponse({error: "Error during fetch operation"});
          }
        }

        if (message.action === "URL-API-Background-2") {
          
          const response = await Test_Hussar_API();
          if (response.error && response.error.includes("404")) {
            sendResponse({error: "Error during fetch operation api may be down"});
          }
          else {
            sendResponse(response);
          }
        }

        if (message.action === "URL-API-Background-3") {

            const response = await fetch(DEFAULT_API_URL + "/scan", {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({email_words_list: message.email_words_list})});
            try {
            const data = await response.json();

            sendResponse(data);
            }
            catch (error) {
              console.error("Error during fetch operation:", error);
              sendResponse({error: "Error during fetch operation"});
              }

            }

        if (message.action === "Alive_Hussar_API") {
          const response = await Alive_Hussar_API();
          sendResponse(response);
        }
        
    })(); //close async function
    return true; // respond async  need to keep the port open
});

