import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getExpandedRowModel,
} from "@tanstack/react-table";
import sampleData from "../data/sampleData.json";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import React, { useMemo, useState } from "react";

function TableComponent() {
  const data = useMemo(() => sampleData.rows, []);
  //initialized state for input values
  const [inputValues, setInputValues] = useState({});

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
          type="number"
          value={inputValues[row.id] ?? ""}
          onChange={(e) =>
            setInputValues({ ...inputValues, [row.id]: e.target.value })
          }
          style={{ width: "80px" }}
        />
      ),
    },

    {
      header: "Allocation %",
      cell: ({ row }) => (
        <button
          onClick={() => {
            const input = Number(inputValues[row.id]);
            if (!input || isNaN(input)) return;

            // to update currentValue and parent value
            const newValues = { ...currentValues };
            const percentValue = (input * currentValues[row.id]) / 100;
            newValues[row.id] = percentValue + currentValues[row.id];
            //to check whether it is child and to update the parent value
            if (row.depth > 0) {
              newValues[row.parentId] += percentValue;
            }

            console.log("row is: ", row);

            //to update the child when parent is updated directly
            const children = row.subRows;
            // const demo = children.forEach((child)=>{console.log(child)})
            const total = children.reduce(
              (sum, child) => sum + Number(currentValues[child.id] || 0),
              0
            );
            // console.log("total is "+total);
            const parentValue = newValues[row.id];
            console.log(newValues[row.id]);
            children.forEach((child) => {
              const percent = (currentValues[child.id] * input) / 100 || 0;
              newValues[child.id] = Number(
                (currentValues[child.id] + percent).toFixed(2)
              );
            });
            setCurrentValues(newValues);
            setInputValues((prev) => ({ ...prev, [row.id]: "" }));
          }}
        >
          %
        </button>
      ),
    },

    {
      header: "Allocation Val",
      cell: ({ row }) => (
        <button
          onClick={() => {
            const input = Number(inputValues[row.id]);
            if (!input || isNaN(input)) return;

            // console.log("portion" + portion);
            // console.log("children length",children.length);

            // if ((row.depth = 0)) return;
            //to be updated at currentValue
            const portion = input;
            const newValues = { ...currentValues };
            const parentValue = currentValues[row.id];
            newValues[row.id] = Number(portion.toFixed(2));
            const valueDifference = newValues[row.id] - currentValues[row.id];

            //when child changed should be updated to parent
            if (row.depth > 0) {
              newValues[row.parentId] += valueDifference;
            }

            //when subtotal changed => values distributed to children

            const children = row.subRows;
            // const demo = children.forEach((child)=>{console.log(child)})
            children.forEach((child) => {
              const childPortion =
                (portion * ((currentValues[child.id] / parentValue) * 100)) /
                100;
              console.log(
                "portion of " + child.original.label + " is " + childPortion
              );
              newValues[child.id] = Number(childPortion.toFixed(2));
            });
            setCurrentValues(newValues);
            setInputValues((prev) => ({ ...prev, [row.id]: "" }));
          }}
        >
          Val
        </button>
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
  console.log(table.getCoreRowModel().rows[0].depth);
  console.log(table.getRowModel().rows);

  const [currentValues, setCurrentValues] = useState(() => {
    const initial = {};
    table.getRowModel().rows.forEach(function fill(row) {
      initial[row.id] = row.original.value;
      row.children?.forEach(fill);
    });
    return initial;
  });
  console.log("currentValues", currentValues);

  return (
    <div className="tableDiv">
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <React.Fragment key={row.id}>
              <tr>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    
                    {cell.column.columnDef.header === "Label" && row.depth > 0 ? "=>": ""}
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TableComponent;
