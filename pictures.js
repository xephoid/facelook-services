
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const { Configuration, OpenAIApi } = require("openai");

let TESTING = false;
if (!process.env.NODE_ENV) {
  console.log("Loading .env");
  require("dotenv").config();
  TESTING = true;
} else {
  console.log("Environment is production");
}

exports.generateProfilePic = async (req, res) => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  const openai = new OpenAIApi(configuration);

  const response = 

  res.send(response.data.choices[0].text);
}