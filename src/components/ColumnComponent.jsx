
import React from 'react'

function ColumnComponent(setInputValues,inputValues) {
    const columns = [
        {
            header: 'Label',
            accessorKey: 'label',
        },
        {
            header: 'Value',
            cell: ({ row }) => currentValues[row.id] ?? row.original.value
          },          
        
        {
          header: 'Input',
          cell: ({ row }) => (
            <input
              type="number"
              value={inputValues[row.id] ?? ''}
              onChange={(e) =>
                setInputValues({ ...inputValues, [row.id]: e.target.value })
              }
              style={{ width: "80px"}}
            />
          ),
        },
    
        {
            header: 'Allocation %',
            cell: ({ row }) => (
              <button
                onClick={() => {
                  const input = Number(inputValues[row.id]);
                  console.log("input for "+row.id+" is "+input)
                  if (!input || isNaN(input)) return;
                  
                  // to update currentValue and parent value
                  const newValues = { ...currentValues };
                  const percentValue = (input * currentValues[row.id])/100;
                  newValues[row.id] = percentValue+currentValues[row.id];
                  //to check whether it is child and to update the parent value
                  if (row.depth>0){newValues[row.parentId] += percentValue}
    
                  console.log("row is: ",row);
                  
                  //to update the child when parent is updated directly
                  const children = row.subRows;
                  // const demo = children.forEach((child)=>{console.log(child)})
                  const total = children.reduce((sum, child) => sum + Number(currentValues[child.id] || 0), 0);
                  // console.log("total is "+total);
                  const parentValue = newValues[row.id]
                  console.log(newValues[row.id])
                  children.forEach((child) => {
                    const percent = ((currentValues[child.id]*input)/100 || 0);
                    newValues[child.id] = Number((currentValues[child.id]+percent).toFixed(2));
                  });
                  setCurrentValues(newValues);
                  setInputValues((prev) => ({ ...prev, [row.id]: '' }));
                }}
              >
                %
              </button>
            ),
          },          
    
          {
            header: 'Allocation Val',
            cell: ({ row }) => (
              <button
                onClick={() => {
                  const input = Number(inputValues[row.id]);
                  if (!input || isNaN(input)) return;
                  
                  // console.log("portion" + portion);
                  // console.log("children length",children.length);
    
                  if(row.depth=0) return;
                  //to be updated at currentValue
                  const portion = input;
                  const newValues = { ...currentValues };
                  const parentValue = currentValues[row.id];
                  newValues[row.id] = Number(portion.toFixed(2));
                  const valueDifference = newValues[row.id]-currentValues[row.id];
    
                  //when child changed should be updated to parent
                  if (row.depth>0){newValues[row.parentId] += valueDifference}
    
    
                  //when subtotal changed => values distributed to children
                  
                  const children = row.subRows;
                  // const demo = children.forEach((child)=>{console.log(child)})
                  children.forEach((child) => {
                    const childPortion = (portion * ((currentValues[child.id]/parentValue)*100))/100;
                    console.log("portion of "+ child.original.label+ " is "+ childPortion);
                    newValues[child.id] = Number(childPortion.toFixed(2));
                  });
                  setCurrentValues(newValues);
                  setInputValues((prev) => ({ ...prev, [row.id]: '' }));
                }}
              >
                Val
              </button>
            ),
          },          
    
          {
            header: 'Variance %',
            cell: ({ row }) => {
              const current = Number(currentValues[row.id]);
              const original = Number(row.original.value);
              // console.log("row:"+row.id+original)
              const variance = original !== 0 ? (((current - original) / original) * 100).toFixed(2) : "0";
              return <span>{variance}%</span>;
            },
          },          
      ];

  return columns;
}

export default ColumnComponent
