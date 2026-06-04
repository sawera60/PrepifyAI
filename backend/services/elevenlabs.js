import axios from "axios";

export const textToSpeech = async (text) => {
  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      {
        text,
        model_id: "eleven_multilingual_v2",
      },
      {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    const audioBuffer = Buffer.from(response.data, "binary");
    return audioBuffer.toString("base64");
  } catch (err) {
    console.error("ElevenLabs error:", err.response?.data || err.message);
    return null;
  }
};