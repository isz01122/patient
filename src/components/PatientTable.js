import React from "react";
import MaterialTable from "material-table";
import { TableIcons } from "../components/Elements";

const PatientTable = ({ patients, onUpdatePatients }) => {
  let data = Object.values(patients.dataById);
  return (
    <div className="table-container">
      <MaterialTable
        title={false}
        icons={TableIcons}
        columns={patients.header}
        data={data}
        detailPanel={rowData => {
          return (
            <div className="detail text-sub-title">
              <div>{`전체 방문 수 : ${rowData.brief.visitCount}`}</div>
              <br />
              <div>{"진단 정보"}</div>
              {rowData.brief.conditionList.map(c => (
                <div>{`* ${c}`}</div>
              ))}
            </div>
          );
        }}
        onRowClick={(event, rowData, togglePanel) => {
          onUpdatePatients(togglePanel, rowData);
        }}
        options={{
          showTitle: false,
          search: false,
          pageSize: 5,
          pageSizeOptions: [5, 10, 15],
          toolbar: false,
          columnsButton: false
        }}
      />
    </div>
  );
};

export default PatientTable;
