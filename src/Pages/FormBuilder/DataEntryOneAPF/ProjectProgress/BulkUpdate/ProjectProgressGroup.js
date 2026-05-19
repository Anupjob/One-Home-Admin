import React, { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import FilterWithButtonsCard from "../../../../../Utils/FilterWithButtonsCard";
import { useNavigate, useLocation } from "react-router-dom";
import getApiCall from "../../../../../Services/getApiCall";
import CustomButton from "../../../../../Utils/CustomButton";

const ProjectProgressGroup = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const state = location.state
    const [agencyTypeList, setAgencyTypeList] = useState([
        { label: 'Employee', value: 'Employee' },
        { label: 'Vendor', value: 'Vendor' }
    ])
    const [technicalAgencyList, setTechnicalAgencyList] = useState([])
    const [selectedAgencyTypes, setSelectedAgencyTypes] = useState([]);
    const [selectedTechnicalAgency, setSelectedTechnicalAgency] = useState(null);
    const [formData, setFormData] = useState({})
    const [groupData, setGroupData] = useState()

    const toValues = (sel) => {
        if (!sel) return [];
        return Array.isArray(sel) ? sel.map(s => s.value ?? s) : sel.value ?? sel;
    };

    useEffect(() => {
        // getTechnicalListByAgency('Employee')
    }, [])
    const handleAgencyTypeChange = (value) => {
        setSelectedAgencyTypes(value || []);
        setFormData(prev => ({ ...prev, agencyType: toValues(value) }));
        getTechnicalListByAgency(toValues(value))
    };
    const handleTechnicalAgencyChange = (value) => {
        setSelectedTechnicalAgency(value || null);
        setFormData(prev => ({ ...prev, technicalAgencyId: value ? (value.value ?? value) : null }));
    };
    const getTechnicalListByAgency = async (type) => {
        if (!state.idFromURL) return;

        try {
            const paraResponse = await getApiCall(`admin/workflow-instance/by-form-response/${state.workFlowId}/68fb20c0a68bebe5b6ee1c3a/${state.idFromURL}?collectionName=form_agency-assignment`)
            const url = `admin/apf-flow/fetch-technical-list/${paraResponse?.data?.responseId}`;

            const response = await getApiCall(url);
            if (response?.meta?.status) {
                setTechnicalAgencyList(response?.data?.filter((item) => item.selectType == type) || []);
            } else {
                setTechnicalAgencyList([]);
            }
        } catch (error) {
            console.error("Error fetching payment plans:", error);
            setTechnicalAgencyList([]);
        }
    }
    const handleSearch=async()=>{
try {
            const url = `admin/apf-flow/fetch-group-project-entries/${state.idFromURL}`;

            const response = await getApiCall(url);
            if (response?.meta?.status) {
                setGroupData(response?.data);
            } else {
                setGroupData([]);
            }
        } catch (error) {
            console.error("Error fetching payment plans:", error);
            setGroupData([]);
        }
    }
    const resetFilter=()=>{
        setSelectedAgencyTypes(null)
        setSelectedTechnicalAgency(null)
    }
    const renderFilter = () => (
        <div className='moduleList'>
            <div >
                {/* <label className="fw-semibold">Agency Type *</label> */}
                <CreatableSelect
                    name="agencyType"
                    isClearable
                    styles={{height:'30px'}}
                    placeholder="Type to search or create..."
                    value={selectedAgencyTypes}
                    onChange={handleAgencyTypeChange}
                    options={agencyTypeList}
                />
            </div>
            <div >
                {/* <label className="fw-semibold">Technical Agency *</label> */}
                <CreatableSelect
                    name="technicalAgency"
                    isClearable
                    styles={{height:'30px'}}
                    
                    placeholder="Type to search or create..."
                    value={selectedTechnicalAgency}
                    onChange={handleTechnicalAgencyChange}
                    options={technicalAgencyList.map((item) => ({ label: item.selectAgencyUnitName, value: item.selectAgencyUnit }))}
                />
            </div>
            <CustomButton
                label="Search"
                variant='danger'
                appendClass='text-white d-none d-md-block'
            onClick={handleSearch}
            />
            {/* <CustomButton
                label="Reset"
                variant='danger'
                appendClass="text-black border border-primary  d-none d-md-block" updateBgColor={"#fff"}
            onClick={resetFilter}
            /> */}

        </div>
    )
    return (<>
        <div className="container-fluid">
            <div className="main-title">
                <FilterWithButtonsCard title="Project Progress Group" filters={renderFilter()} />
            </div>

        </div>
    </>)
}
export default ProjectProgressGroup;