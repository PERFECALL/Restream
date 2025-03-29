const axios = require('axios');

module.exports = async (req, res) => {
  // Log the entire query object to debug the incoming request
  console.log('Request Query:', req.query);

  // Extract the `id` parameter from the query string
  const { id } = req.query;

  // If `id` is not provided, return an error message
  if (!id) {
    return res.status(400).send('ID parameter is required.');
  }

  // Correct URL to fetch the stream, using the watchindia.net domain
  const urlForDomain = `http://watchindia.net:8880/live/97869/86543/${id}.ts`;

  try {
    // First request to fetch the domain (allow redirects)
    const responseForDomain = await axios.get(urlForDomain, {
      headers: {
        'User-Agent': 'OTT Navigator/1.6.7.4 (Linux;Android 11) ExoPlayerLib/2.15.1',
        'Host': 'watchindia.net:8880',  // Correct host here
        'Connection': 'Keep-Alive',
        'Accept-Encoding': 'gzip',
      },
    });

    const locationUrl = responseForDomain.headers['location'];

    if (!locationUrl) {
      return res.status(500).send('Error extracting location URL.');
    }

    // Extract the domain from the location URL
    const domain = new URL(locationUrl).host;

    // Second request to fetch the stream
    const responseForTs = await axios.get(`http://watchindia.net:8880/live/97869/86543/${id}.ts`, {
      headers: {
        'User-Agent': 'OTT Navigator/1.6.7.4 (Linux;Android 11) ExoPlayerLib/2.15.1',
        'Host': 'watchindia.net:8880',  // Correct host here
        'Connection': 'Keep-Alive',
        'Accept-Encoding': 'gzip',
      },
      responseType: 'arraybuffer',
    });

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