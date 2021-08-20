import axios from "axios";
const baseUrl = process.env.REACT_APP_PATIENT_API_BASE_URL;

class Api {
  async getAllData() {
    let response = {
      patients: null,
      gender: null,
      race: null,
      ethnicity: null
    };

    // NOTE: 깃허브 페이지 배포시 https -> http API 호출할때 아래와 같이 사용
    // https://cors-anywhere.herokuapp.com/http://111.111.111.111:3000/api/race/list

    let patients = await axios(`${baseUrl}/api/patient/list`);
    let gender = await axios(`${baseUrl}/api/gender/list`);
    let race = await axios(`${baseUrl}/api/race/list`);
    let ethnicity = await axios(`${baseUrl}/api/ethnicity/list`);
    let stats = await axios(`${baseUrl}/api/patient/stats`);

    response.patients = patients.data.patient;
    response.gender = gender.data.genderList;
    response.race = race.data.raceList;
    response.ethnicity = ethnicity.data.ethnicityList;
    response.stats = stats.data.stats;
    return response;
  }

  async getPatientBrief(personId) {
    let response = await axios.get(`${baseUrl}/api/patient/brief/${personId}`);
    return response;
  }

  async getPatients(filteredUrl) {
    let response = await axios.get(filteredUrl);
    return response;
  }
}

export default Api;
