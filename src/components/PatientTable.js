import React, { useEffect, useRef, useState } from "react";
import MaterialTable from "material-table";
import { TableIcons } from "../components/Elements";

const PatientTable = ({ patients, onUpdatePatients, row }) => {
  let tableRef = useRef();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (row.personId) {
      let index = tableRef.current.dataManager.sortedData.findIndex(
        element => element.personID === row.personId
      );
      tableRef.current.onToggleDetailPanel([index], rowData => (
        <div className="detail text-sub-title">
          <div className="text-title">{`전체 방문 수 : ${row.visitCount}회`}</div>
          <br />
          <div className="text-title">{"진단 정보"}</div>
          {row.conditionList.length === 0 ? (
            <div className="text-sub-title">{`(진단 정보가 없습니다.)`}</div>
          ) : (
            row.conditionList?.map(c => (
              <div className="text-sub-title">{`* ${c}`}</div>
            ))
          )}
        </div>
      ));
      setIsLoading(false);
    }
  }, [row]);

  return (
    <div className="table-container">
      <MaterialTable
        isLoading={isLoading}
        tableRef={tableRef}
        title={false}
        icons={TableIcons}
        columns={patients.header}
        data={patients.data}
        onRowClick={(event, rowData, togglePanel) => {
          onUpdatePatients(togglePanel, rowData);
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
