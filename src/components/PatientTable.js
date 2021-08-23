import React, { useEffect, useRef, useState } from "react";
import MaterialTable from "material-table";
import { TableIcons } from "../components/Elements";

const PatientTable = ({ patients, onPatientPress, patientBrief }) => {
  const [isLoading, setIsLoading] = useState(false);
  let tableRef = useRef();

  useEffect(() => {
    if (patientBrief.personId) {
      const index = tableRef.current.dataManager.sortedData.findIndex(
        element => element.personID === patientBrief.personId
      );
      tableRef.current.onToggleDetailPanel([index], rowData => (
        <div className="detail text-sub-title">
          <div className="text-title">{`전체 방문 수 : ${patientBrief.visitCount}회`}</div>
          <br />
          <div className="text-title">{"진단 정보"}</div>
          {patientBrief.conditionList.length === 0 ? (
            <div className="text-sub-title">{`(진단 정보가 없습니다.)`}</div>
          ) : (
            patientBrief.conditionList?.map(c => (
              <div className="text-sub-title">{`* ${c}`}</div>
            ))
          )}
        </div>
      ));
      setIsLoading(false);
    }
  }, [patientBrief]);

  return (
    <div className="table-container">
      <MaterialTable
        isLoading={isLoading}
        tableRef={tableRef}
        icons={TableIcons}
        columns={patients.header}
        data={patients.data}
        onRowClick={(event, rowData, togglePanel) => {
          onPatientPress(rowData);
          setIsLoading(true);
        }}
        options={{
          showTitle: false,
          search: false,
          pageSize: 5,
          pageSizeOptions: [5, 10, 15],
          toolbar: false,
          headerStyle: {
            paddingLeft: "50px"
          }
        }}
      />
    </div>
  );
};

export default PatientTable;
