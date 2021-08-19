import { useEffect, useState } from "react";
import PatientTable from "../components/PatientTable";
import {
  FormControl,
  FormGroup,
  Button,
  InputLabel,
  MenuItem,
  Select,
  Input,
  CircularProgress
} from "@material-ui/core";
import axios from "axios";
import { Pie } from "react-chartjs-2";

import { getData } from "../services/API";

const INIT_OPTIONS = {
  gender: null,
  age_min: null,
  age_max: null,
  race: null,
  ethnicity: null,
  isDeath: null
};
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};
const Age = Array.from({ length: 150 }, (value, index) => index + 1);
const baseUrl = process.env.REACT_APP_PATIENT_API_BASE_URL;

function PatientPage() {
  const [isReady, setIsReady] = useState(false);
  const [patients, setPatients] = useState({});
  const [filterOptions, setFilterOptions] = useState({
    gender: null,
    age_min: null,
    age_max: null,
    race: null,
    ethnicity: null,
    isDeath: [true, false]
  });
  const [selectedOptions, setSelectedOptions] = useState(INIT_OPTIONS);
  const [stats, setStats] = useState([]);
  const [filteredStats, setFilteredStats] = useState([]);
  const [isReset, setIsReset] = useState(false);
  const [row, setRow] = useState({});

  useEffect(() => {
    getData()
      .then(response => {
        const _patients = buildTable(response.patients);
        setPatients(_patients);
        setFilterOptions({
          ...filterOptions,
          gender: response.gender,
          race: response.race,
          ethnicity: response.ethnicity
        });
        setStats(response.stats);
        setFilteredStats(response.stats);
      })
      .then(() => setIsReady(true))
      .catch(error => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    if (isReset) {
      handleApplyChanges();
      setIsReset(false);
    }
  }, [isReset]);

  const buildTable = patients => {
    let patientsById = patients.list.reduce((obj, patient) => {
      obj[patient.personID] = patient;
      return obj;
    }, {});
    let _patients = {};
    _patients.header = [
      { title: "환자 ID", field: "personID" },
      {
        title: "성별",
        field: "gender",
        render: patient => {
          return patient.gender === "M" ? "남자" : "여자";
        }
      },
      {
        title: "생년월일",
        field: "birthDatetime",
        cellStyle: { width: "20%" }
      },
      { title: "나이", field: "age" },
      { title: "인종", field: "race" },
      { title: "민족", field: "ethnicity" },
      {
        title: "사망 여부",
        field: "isDeath",
        render: patient => {
          return patient.isDeath ? "사망" : "생존";
        }
      }
    ];
    _patients.data = patients.list;
    _patients.dataById = patientsById;

    return _patients;
  };

  const handleDatasetChange = (e, value) => {
    setSelectedOptions({
      ...selectedOptions,
      [value]: e.target.value
    });
  };

  const handleApplyChanges = async () => {
    let url = new URL(`${baseUrl}/api/patient/list`);
    let search_params = url.searchParams;
    let temp = stats;

    Object.entries(selectedOptions).filter(option => option[1] !== null)
      .length > 0
      ? Object.entries(selectedOptions)
          .filter(option => option[1] !== null)
          .map(option => {
            if (option[0] === "isDeath") {
              search_params.append("death", option[1]);
            } else {
              search_params.append(option[0], option[1]);
              if (option[0] === "gender") {
                let _gender = temp.filter(s => s[option[0]] === option[1]);
                temp = _gender;
              }
              if (option[0] === "race") {
                let _race = temp.filter(s => s[option[0]] === option[1]);
                temp = _race;
              }
              if (option[0] === "ethnicity") {
                let _ethnicity = temp.filter(s => s[option[0]] === option[1]);
                temp = _ethnicity;
              }
            }
          })
          .forEach((a, i) => {
            if (i === 0) {
              setFilteredStats(temp);
            }
          })
      : setFilteredStats(stats);

    url.search = search_params.toString();
    let new_url = url.toString();

    let _patients = await axios.get(new_url);
    _patients = buildTable(_patients.data.patient);
    setPatients(_patients);
  };

  const handleUpdatePatients = async (toggle, rowData) => {
    let brief = await axios.get(
      `${baseUrl}/api/patient/brief/${rowData.personID}`
    );
    brief = brief.data;

    setRow({ ...brief, tableId: rowData.tableData.id });
  };

  const buildForChart = value => {
    if (value === "gender") {
      let chart = {
        labels: [],
        data: []
      };
      let male = 0;
      let female = 0;
      filteredStats.map(s => {
        s.gender === "M" ? (male += s.count) : (female += s.count);
      });
      let total = male + female;

      chart.labels = ["남자", "여자"];
      chart.data = [(male / total) * 100, (female / total) * 100];

      return chart;
    } else if (value === "race") {
      let chart = {
        labels: [],
        data: []
      };
      let _race = filterOptions.race?.reduce((obj, r) => {
        obj[r] = 0;
        return obj;
      }, {});
      filteredStats.map(s => {
        _race[s.race] += s.count;
      });
      if (_race) {
        let total = Object.values(_race).reduce((a, b) => a + b, 0);

        chart.labels = Object.keys(_race);
        chart.data = Object.values(_race).map(val => (val / total) * 100);
      }

      return chart;
    } else if (value === "ethnicity") {
      let chart = {
        labels: [],
        data: []
      };
      let _ethnicity = filterOptions.ethnicity?.reduce((obj, r) => {
        obj[r] = 0;
        return obj;
      }, {});
      filteredStats.map(e => {
        _ethnicity[e.ethnicity] += e.count;
      });
      if (_ethnicity) {
        let total = Object.values(_ethnicity).reduce((a, b) => a + b, 0);

        chart.labels = Object.keys(_ethnicity);
        chart.data = Object.values(_ethnicity).map(val => (val / total) * 100);
      }

      return chart;
    }
  };

  const options = {
    legend: {
      display: true,
      position: "right"
    },
    tooltips: {
      enabled: true,
      mode: "single",
      callbacks: {
        label: function (tooltipItems, data) {
          let _data = data.datasets[0].data[tooltipItems.index].toFixed(1);
          return _data + "%";
        }
      }
    },
    maintainAspectRatio: false
  };

  const data = [
    {
      labels: buildForChart("gender").labels,
      datasets: [
        {
          labels: buildForChart("gender").labels,
          data: buildForChart("gender").data,
          borderWidth: 2,
          hoverBorderWidth: 3,
          backgroundColor: [
            "rgba(98, 181, 229, 1)",
            "rgba(238, 102, 121, 1)",
            "rgba(255, 198, 0, 1)"
          ],
          fill: true
        }
      ]
    },
    {
      labels: buildForChart("race").labels,
      datasets: [
        {
          labels: buildForChart("race").labels,
          data: buildForChart("race").data,
          borderWidth: 2,
          hoverBorderWidth: 3,
          backgroundColor: [
            "rgba(98, 181, 229, 1)",
            "rgba(238, 102, 121, 1)",
            "rgba(255, 198, 0, 1)",
            "rgba(111, 86, 214, 1)",
            "rgba(90, 214, 86, 1)"
          ],
          fill: true
        }
      ]
    },
    {
      labels: buildForChart("ethnicity").labels,
      datasets: [
        {
          labels: buildForChart("ethnicity").labels,
          data: buildForChart("ethnicity").data,
          borderWidth: 2,
          hoverBorderWidth: 3,
          backgroundColor: [
            "rgba(98, 181, 229, 1)",
            "rgba(238, 102, 121, 1)",
            "rgba(255, 198, 0, 1)"
          ],
          fill: true
        }
      ]
    }
  ];

  return (
    <div className="main">
      {isReady && (
        <div className="container">
          <div className="text-title mb-20">{"환자 정보"}</div>
          <div className="chart-container">
            <div>
              <Pie options={options} data={data[0]} height={150} />
            </div>
            <div>
              <Pie options={options} data={data[1]} height={150} />
            </div>
            <div>
              <Pie options={options} data={data[2]} height={150} />
            </div>
          </div>
          <FormGroup
            className="MuiFormGroup-options filter-form-container jc-fe"
            row
          >
            <FormControl className="filter-form " variant="standard">
              <InputLabel>성별</InputLabel>
              <Select
                value={selectedOptions.gender || ""}
                onChange={e => handleDatasetChange(e, "gender")}
              >
                {filterOptions.gender.map(gender => (
                  <MenuItem value={gender}>
                    {gender === "M" ? "남자" : "여자"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl className="filter-form " variant="standard">
              <InputLabel>최소 나이</InputLabel>
              <Select
                value={selectedOptions.age_min || ""}
                onChange={e => handleDatasetChange(e, "age_min")}
                input={<Input />}
                MenuProps={MenuProps}
              >
                {Age.map(age => (
                  <MenuItem key={age} value={age}>
                    {age}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl className="filter-form " variant="standard">
              <InputLabel>최대 나이</InputLabel>
              <Select
                value={selectedOptions.age_max || ""}
                onChange={e => handleDatasetChange(e, "age_max")}
                input={<Input />}
                MenuProps={MenuProps}
              >
                {Age.map(age => (
                  <MenuItem key={age} value={age}>
                    {age}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl className="filter-form " variant="standard">
              <InputLabel>인종</InputLabel>
              <Select
                value={selectedOptions.race || ""}
                onChange={e => handleDatasetChange(e, "race")}
              >
                {filterOptions.race.map(race => (
                  <MenuItem value={race}>{race}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl className="filter-form " variant="standard">
              <InputLabel>민족</InputLabel>
              <Select
                value={selectedOptions.ethnicity || ""}
                onChange={e => handleDatasetChange(e, "ethnicity")}
              >
                {filterOptions.ethnicity.map(ethnicity => (
                  <MenuItem value={ethnicity}>{ethnicity}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl className="filter-form " variant="standard">
              <InputLabel>사망여부</InputLabel>
              <Select
                value={
                  selectedOptions.isDeath !== null
                    ? selectedOptions.isDeath
                    : ""
                }
                onChange={e => handleDatasetChange(e, "isDeath")}
              >
                {filterOptions.isDeath.map(isDeath => (
                  <MenuItem value={isDeath}>
                    {isDeath === true ? "사망" : "생존"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              className="reset-btn mr-20"
              onClick={() => {
                setSelectedOptions(INIT_OPTIONS);
                setIsReset(true);
              }}
            >
              초기화
            </Button>
            <Button className="filter-btn" onClick={handleApplyChanges}>
              조회
            </Button>
          </FormGroup>
          <PatientTable
            patients={patients}
            onUpdatePatients={handleUpdatePatients}
            row={row}
          />
        </div>
      )}
      {!isReady && (
        <div className="main">
          <div className="loading">
            <CircularProgress />
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientPage;
