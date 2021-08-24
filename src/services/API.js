import axios from "axios";
const baseUrl = "http://49.50.167.136:9871";

class API {
  async getAllData() {
    let response = {
      patients: null,
      gender: null,
      race: null,
      ethnicity: null
    };

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

const instance = new API();
export default instance;
