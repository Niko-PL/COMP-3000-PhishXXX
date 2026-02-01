// this script is used to bypass the CORS policy of the Virus Total API
// as the CORS policy blocks it running in Check_url ffs
// should be a background worker and apear in extention as so (liitle red)

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
    })(); //close async function
    return true; // respond async  need to keep the port open
});
