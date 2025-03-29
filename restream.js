const axios = require('axios');

module.exports = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send('ID parameter is required.');
  }

  const urlForDomain = `http://watchindia.net:8880/live/97869/86543/2182.ts`;  // URL for fetching stream.

  try {
    // First request to fetch the stream
    const responseForDomain = await axios.get(urlForDomain, {
      headers: {
        'User-Agent': 'OTT Navigator/1.6.7.4 (Linux;Android 11) ExoPlayerLib/2.15.1',
        'Host': 'watchindia.net:8880',
        'Connection': 'Keep-Alive',
        'Accept-Encoding': 'gzip',
      },
      maxRedirects: 0, // We don't want to follow redirects automatically
    });

    // Get the location URL from headers (for redirects)
    const locationUrl = responseForDomain.headers['location'];

    if (!locationUrl) {
      return res.status(500).send('Error extracting location URL.');
    }

    const domain = new URL(locationUrl).host;

    // Second request to fetch the actual stream, following any redirection
    const responseForTs = await axios.get(locationUrl, {
      headers: {
        'User-Agent': 'OTT Navigator/1.6.7.4 (Linux;Android 11) ExoPlayerLib/2.15.1',
        'Host': domain,  // Ensure correct domain in headers
        'Connection': 'Keep-Alive',
        'Accept-Encoding': 'gzip',
      },
      responseType: 'arraybuffer',  // Get stream content
    });

    // Modify response if needed (replace paths or URLs, etc.)
    const modifiedResponseTextForTs = responseForTs.data.toString().replace(
      '/hlsr/', 
      `http://${domain}/hlsr/`  // Replace if the path needs to be fixed.
    );

    res.send(modifiedResponseTextForTs);
  } catch (error) {
    // Catch any error and return the status code
    if (error.response) {
      if (error.response.status === 403) {
        return res.status(403).send('Error: 403 Forbidden');
      } else {
        return res.status(500).send(`Error: ${error.response.status}`);
      }
    }

    // Catch any unexpected errors
    return res.status(500).send('An error occurred.');
  }
};
