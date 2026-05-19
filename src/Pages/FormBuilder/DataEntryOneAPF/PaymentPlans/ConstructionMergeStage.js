import React, { useState } from "react";
import CustomButton from "../../../../Utils/CustomButton";
import ConfirmationModal from "../../ConfirmationModal";

const ConstructionMergeStage = ({
    constructionStageList,
    setConstructionStageList,
    handleCloseModal
}) => {
    // const [constructionStageList, setStageList] = useState(selectedPaymentPlan?.formFields?.dataGrid || [])
    const [stageMergeName, setStageMergeName] = useState('')
    const [isOpen, setIsOpen] = useState(false)

    const handleMerge = () => {
        // collect checked checkboxes in the table body
        const checked = Array.from(
            document.querySelectorAll('table.table tbody input[type="checkbox"]:checked')
        );

        // validate - ensure all selected rows are same "floorwise" type
        const selectedItems = checked.map((ch) => {
            const tr = ch.closest('tr');
            const tbody = tr.parentNode;
            const idx = Array.prototype.indexOf.call(tbody.children, tr);
            return constructionStageList[idx];
        });

        // if some selected items are missing (defensive)
        if (selectedItems.some((it) => !it)) {
            alert("Selection error. Please try again.");
            return;
        }

        const hasFloorwiseTrue = selectedItems.some((it) => !!it.floorwiseSeparation);
        const hasFloorwiseFalse = selectedItems.some((it) => !it.floorwiseSeparation);

        if (hasFloorwiseTrue && hasFloorwiseFalse) {
            alert("Only same floor wise merging allowed. Please select items all with Floor Rise = Yes or all with Floor Rise = No.");
            return;
        }
        if (checked.length < 2 || !stageMergeName.trim()) {
            // optionally show a message here
            return;
        }

        // compute row indices of checked rows
        const indices = checked
            .map((ch) => {
                const tr = ch.closest('tr');
                const tbody = tr.parentNode;
                return Array.prototype.indexOf.call(tbody.children, tr);
            })
            .sort((a, b) => a - b);

        // gather items to merge
        const mergedItems = indices.map(i => constructionStageList[i]);

        const mergedStages = mergedItems.map(item => {
            // already merged → preserve history
            if (item.mergedStages && item.mergedStages.length) {
                return {
                    mergeName: item.stageOfConstruction, // 👈 store previous merge name
                    stages: item.mergedStages
                };
            }

            // simple stage
            return item.stageOfConstruction;
        });

        const newItem = {
            ...mergedItems[0],
            stageOfConstruction: stageMergeName, // new merge name
            mergedStages
        };

        // remove selected items
        const newList = constructionStageList.filter(
            (_, i) => !indices.includes(i)
        );

        // insert merged item
        newList.splice(indices[0], 0, newItem);

        setConstructionStageList(newList);

        setStageMergeName('');

        // uncheck the checkboxes in the DOM
        checked.forEach((ch) => (ch.checked = false));
    };

    const handleCompleteMerge = () => {
        setIsOpen(true)
    }
    const handleConfirm = () => {
        handleCloseModal()
        setIsOpen(false)
    }
    const disMergeItem = (item) => {
        return item.mergedStages.flatMap(entry => {

            // simple stage
            if (typeof entry === "string") {
                return [{
                    ...item,
                    stageOfConstruction: entry,
                    mergedStages: null
                }];
            }

            // previously merged group
            if (typeof entry === "object") {
                return [{
                    ...item,
                    stageOfConstruction: entry.mergeName, // 👈 restore old merge name
                    mergedStages: entry.stages || null
                }];
            }

            return [];
        });
    };

    console.log('constructionStageList:::::', constructionStageList)
    const hasMerged = constructionStageList?.some(item => item.mergedStages && item.mergedStages.length > 0) || false;

    return (<>
        <div className="card mt-3">
            <div className="card-body">
                <div className="table-container-wrapper">
                    <div className="table-wrapper">
                        <table className="table table-bordered" width="100%" cellSpacing="0" style={{ width: '100%', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                            <thead style={{ backgroundColor: "#FCFCFD" }}>
                                <tr>
                                    <th>
                                        Stage Name
                                    </th>
                                    <th>
                                        Floor Rise
                                    </th>
                                    <th>
                                        Merged Stage
                                    </th>
                                    <th>
                                        Action
                                    </th>

                                </tr>
                            </thead>
                            <tbody>
                                {constructionStageList?.map((item, index) => (<>
                                    <tr key={index}>
                                        <td><input type="checkbox" /> {item.stageOfConstruction}</td>
                                        <td>{item.floorwiseSeparation ? 'Yes' : 'No'}</td>
                                        <td>{item.mergedStages && item.mergedStages.length ? 'Yes' : 'No'}</td>

                                        <td>
                                            {item.mergedStages && item.mergedStages.length ? (
                                                <div title="Dis Merge">
                                                    <i
                                                        className="bi bi-exclude"
                                                        onClick={() => {
                                                            const unmergedItems = disMergeItem(item);

                                                            const newList = [...constructionStageList];

                                                            // remove the merged item
                                                            newList.splice(index, 1, ...unmergedItems);

                                                            // update state
                                                            setConstructionStageList(newList);
                                                            // create separate items from mergedStages and replace the merged item
                                                        }}
                                                    ></i>
                                                </div>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                    </tr>
                                </>))}
                            </tbody>

                        </table>
                    </div>
                </div>
            </div>
        </div>
        <div className="card mt-3">
            <div className="card-body">
                <div className="row">
                    <div className="col-md-4">
                        <label className="fw-semibold">Merged Stage Name</label>
                        <input type="text" value={stageMergeName} onChange={(e) => setStageMergeName(e.target.value)} className="form-control" placeholder="Enter Merge Stage Name" />
                    </div>
                    <div className="col-md-8 d-flex justify-content-end">
                        <div>
                            <CustomButton label={'Merge'} appendClass="text-white" onClick={handleMerge} />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* show Complete Merge Stages only when at least one merged group exists */}
      
            <div className="card mt-3">
                <div className="card-body d-flex justify-content-end">
                    <div>
                         <CustomButton label={'Cancel'} appendClass="text-black border border-primary" updateBgColor={"#fff"} onClick={()=>handleCloseModal()} />
                        <CustomButton label={'Complete Merge Stages'} appendClass="text-white mx-2" onClick={handleCompleteMerge} disabled={!hasMerged} />
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
            comment={'You will not be allowed to change the stage of construction once you complete the stage merger. Do you want to continue?'}
        />}
    </>)
}
export default ConstructionMergeStage;