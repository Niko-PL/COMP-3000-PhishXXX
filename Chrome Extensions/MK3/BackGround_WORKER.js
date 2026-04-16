// this script is used to bypass the CORS policy of the Virus Total API
// as the CORS policy blocks it running in Check_url ffs
// should be a background worker and apear in extention as so (liitle red)

const DEFAULT_API_URL = "http://10.233.55.162:5443";


const fetchJsonOrThrow = async (url, options = {}) => {
  const response = await fetch(url, options);
  const rawBody = await response.text();
  let data = null;

  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = { raw: rawBody };
    }
  }

  if (!response.ok) {
    const message = (data && data.error) || `HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    console.error("Error during fetch operation:", error);
    return { error: error.message || "Error during fetch operation" };
  }

  return data || {};
};



const Alive_Hussar_API = async () => {
  try {
    const endpoint = await  DEFAULT_API_URL + "/test";
    const response = await fetch(endpoint, { method: "GET" });
    const data = await response.json();

    if (data.message == "Hello, World!") {
      return true;

    }
    else {
      return false;
    }
  }
  catch (error) {
    console.error("Error during test fetch operation:", error);
    return { error: error.message || "Error during fetch operation" };
  }
}



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

            if (!API_Key|| !url || API_Key.length === 0 || url.length === 0) {
              sendResponse(false);
              return;
            }
                  
              try{
              fetch('https://www.virustotal.com/api/v3/urls', options)
              .then(response => response.json())
              .then(response => {
                console.log("Virus Total response:", response);

                if (!response || !response.data || !response.data.id) {
                  console.error("Virus Total response missing data.id or response is null", response);
                  sendResponse({ error: "Virus Total did not return an analysis id", data: response });
                  return;
                }

                const response_id = response.data.id;
                console.log("Virus Total response ID:", response_id);
                fetch(`https://www.virustotal.com/api/v3/analyses/${response_id}`, options_2)
                .then(res => res.json())
                .then(res => sendResponse(res))
                .catch(err => {
                  console.error(err);
                  sendResponse({ error: err?.message || "Virus Total analysis request failed" });
                });
              })

              }
              catch (error) {
                console.error("Error during fetch operation:", error);
                sendResponse(false);
              }
              


            



              
              
            
            
           
            return;
        }

        if (message.action === "URL-API-Background-1", message.url) {
          console.log("URL API requested");
          console.log("URL:", message.url);
          try {
             
            const data = await fetchJsonOrThrow(DEFAULT_API_URL + "/extend", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ url: message.url })
            });
            sendResponse(data);
          }
          catch (error) {
            console.error("Error during fetch operation:", error);
            sendResponse({ error: error.message || "Error during fetch operation" });
          }
          return;
        }


        if (message.action === "URL-API-Background-3") {

          try {
            const endpoint = await DEFAULT_API_URL + "/scan";
            const data = await fetchJsonOrThrow(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email_words_list: message.email_words_list })
            });
            sendResponse(data);
          } catch (error) {
              console.error("Error during fetch operation:", error);
              sendResponse({ error: error.message || "Error during fetch operation" });
          }
          return;
        }

        if (message.action === "Alive_Hussar_API") {
          const response = await Alive_Hussar_API();
          sendResponse(response);
          return;
        }

        if ( message.action === "Alive_VirusTotal_API"){
          console.log("Virus Total alive status requested");
            try {
              const API_Key = message.API_Key;
              if (!API_Key) {
                sendResponse(false);
                return;
              }

              const response = await fetch("https://www.virustotal.com/api/v3/users/me", {
                method: "GET",
                headers: {
                  accept: "application/json",
                  "x-apikey": API_Key
                }
              });

              sendResponse(response.ok);
            } catch (error) {
              console.error("Virus Total alive check failed:", error);
              sendResponse(false);
            }
            return;
        }

        sendResponse({ error: `Unsupported action: ${message.action}` });
    })().catch((error) => {
      console.error("Unhandled background worker error:", error);
      sendResponse({ error: error.message || "Unhandled background worker error" });
    }); //close async function
    return true; // respond async  need to keep the port open
});

