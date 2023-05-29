import axios from "axios";

const handler = async (req, res) => {
  try {
    // param is uri
    const { uri } = req.query;
    console.log("urii", uri);
    const data = await axios.get(uri);
    console.log("data2", data.data);

    res.status(200).json({ statusCode: 200, data: data.data });
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err.message });
  }
};

export default handler;
