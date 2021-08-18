export async function getData() {
  const axios = require("axios");
  const config = {
    method: "get",
    url: ""
  };
  const response = await axios(config);
  return response;
}
