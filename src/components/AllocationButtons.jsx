import React from "react";

const AllocationButtons = ({
  row,
  type,
  currentValues,
  setCurrentValues,
  handleClick,
}) => {
  const onClick = () => {
    const input = Number(handleClick(row));
    if (!input || isNaN(input)) return;

    const newValues = { ...currentValues };

    if (type === "percent") {
      const percentValue = (input * currentValues[row.id]) / 100;
      newValues[row.id] = percentValue + currentValues[row.id];
      console.log(row)
      const children = row.subRows;
      
      if(!row.subRows || row.subRows.length === 0) {newValues[row.parentId] += percentValue;}
      


      children.forEach((child) => {
        const percent = (currentValues[child.id] * input) / 100 || 0;
        newValues[child.id] = Number(
          (currentValues[child.id] + percent).toFixed(2));
      });
      }
      

    if (type === "value") {
      const portion = input;
      const parentValue = currentValues[row.id];
      newValues[row.id] = Number(portion.toFixed(2));

      const valueDifference = newValues[row.id] - currentValues[row.id];
      
      const children = row.subRows;
      if(!children || children.length === 0)newValues[row.parentId] += valueDifference;
      children.forEach((child) => {
        const childPortion =
          (portion * ((currentValues[child.id] / parentValue) * 100)) / 100;
        newValues[child.id] = Number(childPortion.toFixed(2));
      });
    }

    setCurrentValues(newValues);
    // console.log(calculateRecursiveSum(row, currentValues))
  };
  

  return <button onClick={onClick}>{type === "percent" ? "%" : "Val"}</button>;
};

export default AllocationButtons;