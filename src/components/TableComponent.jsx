import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getExpandedRowModel,
} from "@tanstack/react-table";
import sampleData from "../data/sampleData.json";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { initialCurrentValues } from "../utils/helper";
import AllocationButtons from "./AllocationButtons";
import HeaderGroup from "./HeaderGroup";

function TableComponent() {
  const data = useMemo(() => sampleData.rows, []);

  //initialized state for input values
  // const [currentValues, setCurrentValues] = useState(
  //   initialCurrentValues(data)
  // );
  const inputRef = useRef({});

  const handleClick = (row) => {
    const values = Object.entries(inputRef.current).reduce((acc, [id, ref]) => {
      acc[id] = ref?.value || "";
      return acc;
    }, {});
    inputRef.current[row.id].value = "";
    return values[row.id];
  };

  const columns = [
    {
      header: "Label",
      accessorKey: "label",
    },
    {
      header: "Value",
      cell: ({ row }) => currentValues[row.id] ?? row.original.value,
    },

    {
      header: "Input",
      cell: ({ row }) => (
        <input
          ref={(el) => {
            if (el) inputRef.current[row.id] = el;
          }}
          type="number"
          style={{ width: "80px" }}
        />
      ),
    },

    {
      header: "Allocation %",
      cell: ({ row }) => (
        <AllocationButtons
          row={row}
          type="percent"
          currentValues={currentValues}
          setCurrentValues={setCurrentValues}
          handleClick={handleClick}
        />
      ),
    },

    {
      header: "Allocation Val",
      cell: ({ row }) => (
        <AllocationButtons
          row={row}
          type="value"
          currentValues={currentValues}
          setCurrentValues={setCurrentValues}
          handleClick={handleClick}
        />
      ),
    },

    {
      header: "Variance %",
      cell: ({ row }) => {
        const current = Number(currentValues[row.id]);
        const original = Number(row.original.value);
        // console.log("row:"+row.id+original)
        const variance =
          original !== 0
            ? (((current - original) / original) * 100).toFixed(2)
            : "0";
        let icon = null;
        let color = "black";

        if (variance > 0) {
          icon = <FaArrowUp color="green" />;
          color = "green";
        } else if (variance < 0) {
          icon = <FaArrowDown color="red" />;
          color = "red";
        }

        return (
          <span
            style={{
              color,
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {icon}
            {variance}%
          </span>
        );
      },
    },
  ];

  //initializing the reactTable hook
  const table = useReactTable({
    data,
    columns,
    getSubRows: (row) => row.children,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    initialState: {
      expanded: true, // Expand all rows by default
    },
  });

  const [currentValues, setCurrentValues] = useState(() => {
        const initial = {};
        table.getRowModel().rows.forEach(function fill(row) {
          initial[row.id] = row.original.value;
          row.children?.forEach(fill);
        });
        return initial;
      });

  console.log(currentValues)

  const grandTotal = table
    .getRowModel()
    .rows.filter((row) => row.depth === 0)
    .reduce((sum, row) => sum + (Number(currentValues[row.id]) || 0), 0);

  return (
    <div className="tableDiv">
      <table>
        <HeaderGroup table={table} />
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <React.Fragment key={row.id}>
              <tr>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {cell.column.columnDef.header === "Label" && row.depth > 0
                      ? "=>"
                      : ""}
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            </React.Fragment>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Grand Total</td>
            <td>{grandTotal}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default TableComponent;
