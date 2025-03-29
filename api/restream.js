const axios = require('axios');

// Delay function to introduce retries with a delay (1 second)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to fetch data with retry logic (up to 3 retries)
const fetchDataWithRetry = async (url, retries = 3, delayTime = 1000) => {
  try {
    const response = await axios.get(url);
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... attempts remaining: ${retries}`);
      await delay(delayTime);
      return fetchDataWithRetry(url, retries - 1, delayTime);
    } else {
      throw error;
    }
  }
};

module.exports = async (req, res) => {
  // Log the entire query object to debug the incoming request
  console.log('Request Query:', req.query);

  // Extract the `id` parameter from the query string
  const { id } = req.query;

  // If `id` is not provided, return an error message
  if (!id) {
    return res.status(400).send('ID parameter is required.');
  }

  const urlForDomain = `http://watchindia.net:8880/live/97869/86543/${id}.ts`;

  try {
    // First request to fetch the domain (allow redirects)
    const responseForDomain = await fetchDataWithRetry(urlForDomain, 3, 1000);

    const locationUrl = responseForDomain.headers['location'];

    if (!locationUrl) {
      return res.status(500).send('Error extracting location URL.');
    }

    const domain = new URL(locationUrl).host;

    // Second request to fetch the stream
    const responseForTs = await fetchDataWithRetry(`http://watchindia.net:8880/live/97869/86543/${id}.ts`, 3, 1000);

    // Modify the response text to include the dynamic domain URL
    const modifiedResponseTextForTs = responseForTs.data.toString().replace(
      '/hlsr/',
      `http://${domain}/hlsr/`
    );

    // Send the modified response back to the client
    res.send(modifiedResponseTextForTs);
  } catch (error) {
    console.error("Error details:", error);  // Log the error details

    // Handle different types of errors based on the response status
    if (error.response) {
      if (error.response.status === 403) {
        return res.status(403).send('Error: 403 Forbidden');
      } else {
        return res.status(500).send(`Error: ${error.response.status}`);
      }
    }
    return res.status(500).send('An error occurred.');
  }
};