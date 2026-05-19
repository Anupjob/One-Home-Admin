
import React, { useState } from "react";
import CustomButton from "../../../../Utils/CustomButton";
import ConfirmationModal from "../../ConfirmationModal";

const FloorMergeStage = ({
    data,
    constructionStageList,
    setConstructionStageList,
    handleCloseModal
}) => {
    const [openRows, setOpenRows] = useState({}); // index -> bool
    const [selectedFloors, setSelectedFloors] = useState({}); // index -> Set of floor indices
    const [isOpen, setIsOpen] = useState(false)
    const handleConfirm = () => {
        handleCloseModal()
        setIsOpen(false)
    }
    console.log('data::::::', data)
    const toggleRow = (rowIndex, mergedStages = []) => {
        setOpenRows(prev => {
            const next = { ...prev, [rowIndex]: !prev[rowIndex] };
            return next;
        });

        // initialize selection to all floors when opening
        setSelectedFloors(prev => {
            if (openRows[rowIndex]) return prev; // if closing, keep existing
            if (prev[rowIndex] && prev[rowIndex].length) return prev; // already initialized
            return { ...prev, [rowIndex]: mergedStages.map((_, i) => i) };
        });
    };

    // const toggleFloorSelect = (rowIndex, floorIndex) => {
    //   setSelectedFloors(prev => {
    //     const set = new Set(prev[rowIndex] || []);
    //     set.has(floorIndex) ? set.delete(floorIndex) : set.add(floorIndex);
    //     return { ...prev, [rowIndex]: [...set] };
    //   });
    // };
    const toggleFloorSelect = (rowIndex, floorIndex) => {
        setSelectedFloors((prev) => {
            const current = new Set(prev[rowIndex] || []);
            const newSelection = new Set(current);

            if (newSelection.has(floorIndex)) {
                // If already selected, remove it
                newSelection.delete(floorIndex);
            } else {
                // If adding a floor, ensure consecutive selection
                const selectedArr = [...newSelection, floorIndex].sort((a, b) => a - b);
                for (let i = 1; i < selectedArr.length; i++) {
                    if (selectedArr[i] !== selectedArr[i - 1] + 1) {
                        alert("Please select floors in consecutive order!");
                        return prev; // reject the selection
                    }
                }
                newSelection.add(floorIndex);
            }

            return { ...prev, [rowIndex]: Array.from(newSelection).sort((a, b) => a - b) };
        });
    };

    const buildFloorMergeName = (selected) => {
        const sorted = [...selected].sort((a, b) => a - b).map(i => i + 1);
        const start = sorted[0];
        const end = sorted[sorted.length - 1];
        return start === end ? `Floor ${start}` : `Floor ${start}-${end}`;
    };



    const handleMerge = (rowIndex) => {
        const item = constructionStageList[rowIndex];
        const selected = selectedFloors[rowIndex];

        if (!selected || selected.length === 0) return;

        // 1-based floors
        const floors = selected.map(i => i + 1);

        // auto name Floor 1-3, Floor 2, etc
        const mergeName = buildFloorMergeName(selected);

        const newMerge = { name: mergeName, floors };

        // SAFE: ensure floorMerges is an array
        let currentMerges = [];
        if (Array.isArray(item.floorMerges)) {
            currentMerges = item.floorMerges;
        } else if (item.floorMerges === undefined || item.floorMerges === null) {
            currentMerges = [];
        } else {
            // If item.floorMerges is somehow an object/string from previous data, convert to array
            console.warn("Invalid floorMerges detected, resetting to empty array:", item.floorMerges);
            currentMerges = [];
        }
        console.log('currentMerges:::::::', currentMerges, newMerge, item)
        const updatedItem = {
            ...item,
            floorMerges: [newMerge]
        };

        const newList = [...constructionStageList];
        newList[rowIndex] = updatedItem;
        console.log('newList:::::', newList)
        setConstructionStageList(newList);
        setSelectedFloors(prev => ({ ...prev, [rowIndex]: [] }));
    };





    const handleDisMerge = (rowIndex, mergeIndex) => {
        const item = constructionStageList[rowIndex];

        const newMerges = item.floorMerges.filter(
            (_, i) => i !== mergeIndex
        );

        const newItem = {
            ...item,
            floorMerges: newMerges.length ? newMerges : undefined
        };

        const newList = [...constructionStageList];
        newList[rowIndex] = newItem;
        setConstructionStageList(newList);
    };
    const handleCompleteMerge = () => {
        setIsOpen(true)
    }

    console.log('constructionStageList::::', constructionStageList)
    const hasMerged = constructionStageList?.some(item => item.floorMerges && item.floorMerges.length > 0) || false;
    return (<>
        <div className="card mt-3">
            <div className="card-body">
                <div className="table-container-wrapper">
                    <div className="table-wrapper">
                        <table
                            className="table table-bordered"
                            width="100%"
                            cellSpacing="0"
                            style={{ width: "100%", overflowX: "auto", whiteSpace: "nowrap" }}
                        >
                            <thead style={{ backgroundColor: "#FCFCFD" }}>
                                <tr>
                                    <th>Stage Name</th>
                                    <th>Floor Rise</th>
                                    <th>Merged Stage</th>
                                    {/* <th>Action</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {constructionStageList.map((item, index) => (
                                    <React.Fragment key={index}>

                                        {/* MAIN ROW */}
                                        <tr>
                                            <td>
                                                {item.floorwiseSeparation&&
                                                    <i
                                                        className={`bi ${openRows[index] ? "bi-dash-square" : "bi-plus-square"}`}
                                                        onClick={() => toggleRow(index)}
                                                        style={{ cursor: "pointer", marginRight: 8 }}
                                                    />
                                                }
                                                {item.stageOfConstruction}
                                            </td>
                                            <td>{item.floorwiseSeparation ? "Yes" : "No"}</td>
                                            <td>{item.mergedStages && item.mergedStages.length ? 'Yes' : 'No'}</td>
                                        </tr>

                                        {/* EXPANDED FLOOR MERGE UI */}
                                        {openRows[index] && (
                                            <tr>
                                                <td colSpan={4} style={{ background: "#f8f9fa" }}>

                                                    {/* FLOOR CHECKBOXES */}
                                                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                                        {item?.floorMerges?.map((merge, mi) => (
                                                            <div
                                                                key={mi}
                                                                style={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: 10,
                                                                    //   marginTop: 8,
                                                                    padding: "4px 8px",
                                                                    background: "#e9ecef",
                                                                    borderRadius: 4,
                                                                }}
                                                            >
                                                                <strong>{merge.name}</strong>
                                                                <i
                                                                    className="bi bi-x-circle text-danger"
                                                                    onClick={() => handleDisMerge(index, mi)}
                                                                    style={{ cursor: "pointer" }}
                                                                />
                                                            </div>
                                                        ))}
                                                        {[...Array(Number(data.noOfFloors))].map((_, fi) => {
                                                            const floorNo = fi + 1;
                                                            const hiddenFloors = new Set(
                                                                item.floorMerges?.flatMap(m => m.floors) || []
                                                            );
                                                            if (hiddenFloors.has(floorNo)) return null;

                                                            return (
                                                                <label key={fi} style={{ marginRight: 12 }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        className="mr-2"
                                                                        checked={(selectedFloors[index] || []).includes(fi)}
                                                                        onChange={() => toggleFloorSelect(index, fi)}
                                                                    />
                                                                    Floor {floorNo}
                                                                </label>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* MERGE BUTTON */}
                                                    <div style={{ marginTop: 10, textAlign: "right" }}>
                                                        <CustomButton label={'Merge'} appendClass="text-white" onClick={() => handleMerge(index)} />
                                                    </div>

                                                    {/* MERGED RESULT */}

                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}


                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
             
                    <div className="card mt-3">
                        <div className="card-body d-flex justify-content-end">
                            <div>
                                <CustomButton label={'Cancel'} appendClass="text-black border border-primary" updateBgColor={"#fff"} onClick={()=>handleCloseModal()} />
                                <CustomButton label={'Complete Merge Floors'} appendClass="text-white mx-2" onClick={handleCompleteMerge} disabled={!hasMerged} />
                            </div>
                        </div>
                    </div>
              
                {isOpen && <ConfirmationModal
            show={isOpen}
            onClose={() => setIsOpen(false)}
            firstButton="Yes"
            secondButton="No"
            onConfirm={handleConfirm}
            isAlert
            comment={'You will not be allowed to change the floor of construction once you complete the floor merger. Do you want to continue?'}
        />}
    </>);
};
export default FloorMergeStage;
