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
import { Pie } from "react-chartjs-2";

import API from "../services/API";
const baseUrl = process.env.REACT_APP_PATIENT_API_BASE_URL;
const Age = Array.from({ length: 150 }, (value, index) => index + 1);
const INIT_OPTIONS = {
  gender: null,
  age_min: null,
  age_max: null,
  race: null,
  ethnicity: null,
  isDeath: null
};
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 200,
      width: 250
    }
  }
};
const chartBackgroundColor = [
  "rgba(98, 181, 229, 1)",
  "rgba(238, 102, 121, 1)",
  "rgba(255, 198, 0, 1)",
  "rgba(111, 86, 214, 1)",
  "rgba(90, 214, 86, 1)"
];

const PatientPage = () => {
  const [isReady, setIsReady] = useState(false);
  const [patients, setPatients] = useState({});
  const [filterOptions, setFilterOptions] = useState(INIT_OPTIONS);
  const [selectedOptions, setSelectedOptions] = useState(INIT_OPTIONS);
  const [stats, setStats] = useState([]);
  const [filteredStats, setFilteredStats] = useState([]);
  const [isReset, setIsReset] = useState(false);
  const [patientBrief, setPatientBrief] = useState({});

  useEffect(() => {
    API.getAllData()
      .then(response => {
        const _patients = buildTable(response.patients);
        setPatients(_patients);
        setFilterOptions({
          ...filterOptions,
          gender: response.gender,
          race: response.race,
          ethnicity: response.ethnicity,
          isDeath: [true, false]
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
    let _patients = {};
    _patients.header = [
      {
        title: "환자 ID",
        field: "personID",
        cellStyle: { paddingLeft: "50px" }
      },
      {
        title: "성별",
        field: "gender",
        cellStyle: { paddingLeft: "50px" },
        render: patient => {
          return patient.gender === "M" ? "남자" : "여자";
        }
      },
      {
        title: "생년월일",
        field: "birthDatetime",
        cellStyle: { width: "20%", paddingLeft: "50px" }
      },
      { title: "나이", field: "age", cellStyle: { paddingLeft: "50px" } },
      { title: "인종", field: "race", cellStyle: { paddingLeft: "50px" } },
      { title: "민족", field: "ethnicity", cellStyle: { paddingLeft: "50px" } },
      {
        title: "사망 여부",
        field: "isDeath",
        cellStyle: { paddingLeft: "50px" },
        render: patient => {
          return patient.isDeath ? (
            <p className="c-red p-zero m-zero">사망</p>
          ) : (
            "생존"
          );
        }
      }
    ];
    _patients.data = patients.list;
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
    let _stats = stats;

    let options = Object.entries(selectedOptions).filter(
      option => option[1] !== null
    );
    if (options.length > 0) {
      options.map(option => {
        search_params.append(
          option[0] === "isDeath" ? "death" : option[0],
          option[0] === "age_min"
            ? option[1] - 1
            : option[0] === "age_max"
            ? option[1] + 1
            : option[1]
        );
        if (
          option[0] === "gender" ||
          option[0] === "race" ||
          option[0] === "ethnicity"
        ) {
          let _selectedOption = _stats.filter(s => s[option[0]] === option[1]);
          _stats = _selectedOption;
        }
      });
    }
    setFilteredStats(_stats);

    url.search = search_params.toString();
    let filteredUrl = url.toString();

    API.getPatients(filteredUrl).then(res => {
      let _patients = buildTable(res.data.patient);
      setPatients(_patients);
    });
  };

  const handlePatientPress = async rowData => {
    let brief = {};
    API.getPatientBrief(rowData.personID)
      .then(res => {
        brief = res.data;
      })
      .then(() =>
        setPatientBrief({
          ...brief,
          personId: rowData.personID
        })
      );
  };

  const buildChart = value => {
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
    animation: {
      duration: 1000
    },
    maintainAspectRatio: false
  };

  const data = [
    {
      labels: buildChart("gender").labels,
      datasets: [
        {
          labels: buildChart("gender").labels,
          data: buildChart("gender").data,
          borderWidth: 2,
          hoverBorderWidth: 3,
          backgroundColor: chartBackgroundColor,
          fill: true
        }
      ]
    },
    {
      labels: buildChart("race").labels,
      datasets: [
        {
          labels: buildChart("race").labels,
          data: buildChart("race").data,
          borderWidth: 2,
          hoverBorderWidth: 3,
          backgroundColor: chartBackgroundColor,
          fill: true
        }
      ]
    },
    {
      labels: buildChart("ethnicity").labels,
      datasets: [
        {
          labels: buildChart("ethnicity").labels,
          data: buildChart("ethnicity").data,
          borderWidth: 2,
          hoverBorderWidth: 3,
          backgroundColor: chartBackgroundColor,
          fill: true
        }
      ]
    }
  ];

  return (
    <div>
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
            onPatientPress={handlePatientPress}
            patientBrief={patientBrief}
          />
        </div>
      )}
      {!isReady && (
        <div className="loading">
          <CircularProgress />
        </div>
      )}
    </div>
  );
};

export default PatientPage;
