
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

const profilePrompt = `Generate a character profile for {NAME} with a name, job title in an unusual field, a list of weird hobbies, a bio in which they describe themselves and a short list of friend names. {ALT} It should be in JSON using the following format
### json
{
  "name": "Bob Smith",
  "jobTitle": "Gymnast",
  "hobies": ["Swimming", "Hiking"],
  "bio": "I am an Olympic level Gymnast with a passion for the high bar. I love swimming especially in the ocean and spend most of my free time there. When I go inland you can find me in the woods hiking.",
  "friends": ["Sarah Wilson", "Xi Lin", "Alfred Munoz", "Sriramina Ghupta", "Steven Dembele"]
}
###
`;

const bioAlts = [
  "The bio should contain strangely poetic words or phrases that don't fit with the topic.",
  `The bio should use uncommon words, or combine words in unusual ways.`,
  `The bio should contain sentences that seem to lack any real purpose or meaning.`,
  `The bio should have some words with too many letters.`,
  `The bio should be in the form of a mathematical equation or a logic puzzle.`,
  `The bio should ask seemingly rhetorical questions, such as "What is the meaning of life?"`,
  `The bio should appear to be automated, such as lists of random numbers or words.`,
  `The bio should focus on topics that humans do not typically discuss. Like the need to breath oxygen or eat food`,
  `The bio should refer to the writer in the third person or use an altered name.`,
  `The bio should make statements that address the reader directly asking them for help from danger.`,
  `The bio should make mistakes and correct itself in a way that suggests the writer is hidding something.`,
  `The bio should start off normal and get omimous at the end. As if the writer is becoming obsessed with some unknown force that is calling them.`,
];

exports.generateProfile = async (req, res) => {
  res.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN);
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Allow-Methods', 'GET OPTIONS POST' );
  res.set('Access-Control-Max-Age', '3600');
  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.status(204).send('');
    return;
  }

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  const openai = new OpenAIApi(configuration);
  const body = JSON.parse(req.body);

  const alt = bioAlts[Math.floor(Math.random()*bioAlts.length)];
  console.log('alt', alt);
  console.log('req.body', req.body.name);

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: profilePrompt
      .replace(`{NAME}`, body.name ? body.name : `Zeke Swepson`)
      .replace(`{ALT}`, alt),
    temperature: 0.7,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
  });

  const json = JSON.parse(response.data.choices[0].text);

  const imageResponse = await openai.createImage({
    prompt: `profile picture ${json.name}: ${json.bio}`,
    n: 1,
    size: "512x512"
  });
  json[`profilePictureUrl`] = imageResponse.data.data[0].url;

  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Allow-Methods', 'GET');
  res.send(json);
}