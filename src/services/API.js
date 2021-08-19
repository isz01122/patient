export async function getData() {
  const axios = require("axios");

  let response = {
    patients: null,
    gender: null,
    race: null,
    ethnicity: null
  };

  // NOTE: 깃허브 페이지 배포시 https -> http API 호출할때 아래와 같이 사용
  // https://cors-anywhere.herokuapp.com/http://111.111.111.111:3000/api/race/list

  let patients = await axios("http://49.50.167.136:9871/api/patient/list");
  let gender = await axios("http://49.50.167.136:9871/api/gender/list");
  let race = await axios("http://49.50.167.136:9871/api/race/list");
  let ethnicity = await axios("http://49.50.167.136:9871/api/ethnicity/list");
  let stats = await axios("http://49.50.167.136:9871/api/patient/stats");

  response.patients = patients.data.patient;
  response.gender = gender.data.genderList;
  response.race = race.data.raceList;
  response.ethnicity = ethnicity.data.ethnicityList;
  response.stats = stats.data.stats;
  return response;
}
