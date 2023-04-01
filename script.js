function sendRequestWithQueryParams(obj, url) {
  let queryParams = Object.keys(obj)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]))
    .join("&");
  let fullUrl = url + "?" + queryParams;
  return fetch(fullUrl).then((response) => response.text());
}

// params = {
//   "u": "https://lifelabsproject.tk",
//   "p": "What's the weather in Ohio?",
// };
// url = "https://daisygpt-grounding.tranch-research.repl.co/ground";

// sendRequestWithQueryParams(params, url)
//   .then((responseText) => {
//     console.log(responseText);
//   })
//   .catch((error) => {
//     console.error(error);
//   });
