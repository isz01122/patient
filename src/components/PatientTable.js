import React, { useEffect, useRef } from "react";
import MaterialTable from "material-table";
import { TableIcons } from "../components/Elements";

const PatientTable = ({ patients, onUpdatePatients, row }) => {
  let tableRef = useRef();

  useEffect(() => {
    if (row.tableId >= 0) {
      tableRef.current.onToggleDetailPanel([row.tableId], rowData => (
        <div className="detail text-sub-title">
          <div>{`전체 방문 수 : ${row.visitCount}`}</div>
          <br />
          <div>{"진단 정보"}</div>
          {row.conditionList.map(c => (
            <div>{`* ${c}`}</div>
          ))}
        </div>
      ));
    }
  }, [row]);
  return (
    <div className="table-container">
      <MaterialTable
        tableRef={tableRef}
        title={false}
        icons={TableIcons}
        columns={patients.header}
        data={patients.data}
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
