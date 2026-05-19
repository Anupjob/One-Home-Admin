import React, { useState, useEffect } from "react";
import Select from "react-select";
import getApiCall from "../../Services/getApiCall";
import { userDetails } from "../../Services/authenticationService";

const hierarchyOrder = ["h0Name", "h1Name", "h2Name", "h3Name", "h4Name", "h5Name"];
const dummyData = {
  h0Name: [],
  h1Name: [],
  h2Name: [],
  h3Name: [],
  h4Name: [],
  h5Name: [],
};

const HierarchySelect = ({ responseData, setHierarchyPermission }) => {
  const userDetailsData = userDetails();
  const [hierarchyData, setHierarchyData] = useState({});
  const [options, setOptions] = useState({});
  const [selected, setSelected] = useState({});
  const [visibleLevels, setVisibleLevels] = useState([]);

  useEffect(() => {
    const initial = {};
    if (responseData?.formFields && Object.keys(responseData.formFields).length > 0 && responseData.status!=='REJECTED') {
      hierarchyOrder.forEach((key) => {
        const val = responseData.formFields[key];
        initial[key] = val ? [val] : [];
      });
      setHierarchyData(initial);
    } else {
      setHierarchyData(userDetailsData?.roles?.formFields || dummyData);
    }
  }, [responseData]);

  useEffect(() => {
    const firstLevel = hierarchyOrder[0];
    const firstOptions = Array.isArray(hierarchyData[firstLevel])?hierarchyData[firstLevel]: [hierarchyData[firstLevel]];
    const firstValue = firstOptions?.[0];

    if (firstValue) {
      const updatedOptions = { [firstLevel]: firstOptions };
      const updatedSelected = { [firstLevel]: firstValue };
      setOptions(updatedOptions);
      setSelected(updatedSelected);
      setHierarchyPermission(updatedSelected);
      setVisibleLevels([firstLevel]);
      autoAdvance(firstLevel, firstValue, updatedOptions, updatedSelected, [firstLevel]);
    }
  }, [hierarchyData]);

  const fetchFromAPI = async (parentLevel, parentValue) => {
    const nextIndex = hierarchyOrder.indexOf(parentLevel) + 1;
    const nextLevel = hierarchyOrder[nextIndex];
    if (!nextLevel) return {};

    try {
      const url = `admin/hierarchy/list/root?${parentLevel}=${encodeURIComponent(parentValue)}`;
      const response = await getApiCall(url);
      if (response?.meta?.status) {
        const values = response.data
          .map((item) => item[nextLevel])
          .filter((val) => Array.isArray(val)?'':val && val?.trim() !== "");
        const unique = Array.from(new Set(values));
        return { [nextLevel]: unique };
      }
    } catch (err) {
      console.error("API error:", err);
    }
    return { [nextLevel]: [] };
  };

  const autoAdvance = async (
    level,
    value,
    currentOptions = options,
    currentSelected = selected,
    currentVisible = visibleLevels
  ) => {
    const currentIndex = hierarchyOrder.indexOf(level);
    const newOptions = { ...currentOptions };
    const newSelected = { ...currentSelected, [level]: value };
    const newVisible = [...currentVisible];

    for (let i = currentIndex + 1; i < hierarchyOrder.length; i++) {
      const currentLevel = hierarchyOrder[i];
      const parentLevel = hierarchyOrder[i - 1];
      const parentValue = newSelected[parentLevel];

      let currentValues = (Array.isArray(hierarchyData[currentLevel])?hierarchyData[currentLevel]: [hierarchyData[currentLevel]])|| [];

      if (!currentValues.length) {
        const apiResponse = await fetchFromAPI(parentLevel, parentValue);
        currentValues = apiResponse[currentLevel] || [];
      }

      if (!currentValues.length) break;

      newOptions[currentLevel] = currentValues;

      if (currentValues.length === 1) {
        newSelected[currentLevel] = currentValues[0];
        newVisible.push(currentLevel);
      } else {
        newSelected[currentLevel] = "";
        newVisible.push(currentLevel);
        break; // Stop auto-advancing if multiple
      }
    }

    setOptions(newOptions);
    setSelected(newSelected);
    setHierarchyPermission(newSelected);
    setVisibleLevels([...new Set(newVisible)]);
  };

  const handleChange = (level, selectedOption) => {
    const value = selectedOption?.value || "";
    const currentIndex = hierarchyOrder.indexOf(level);

    const updatedSelected = { ...selected, [level]: value };
    const updatedOptions = { ...options };
    const updatedVisible = hierarchyOrder.slice(0, currentIndex + 1);

    // Clear all children of the changed level
    hierarchyOrder.slice(currentIndex + 1).forEach((lvl) => {
      delete updatedSelected[lvl];
      delete updatedOptions[lvl];
    });

    setSelected(updatedSelected);
    setHierarchyPermission(updatedSelected);
    setOptions(updatedOptions);
    setVisibleLevels(updatedVisible);

    autoAdvance(level, value, updatedOptions, updatedSelected, updatedVisible);
  };

  const renderSelect = (level, index) => {
    let opts = options[level] || [];
    if(!Array.isArray(opts)){
      opts = [opts]
    }
    console.log('opts::::::',opts)
    const isVisible = visibleLevels.includes(level);
    const shouldRender = isVisible && opts?.length > 1;

    if (!shouldRender) return null;

    const selectOptions = opts?.map((opt) => ({ label: opt, value: opt }));
    const selectedVal = selectOptions?.find((opt) => opt.value === selected[level]) || null;

    return (
      <div className="col-md-4 mb-3" key={level}>
        {/* <label className="form-label">{`H${index}`}</label> */}
        <Select
          options={selectOptions}
          placeholder={`H${index}...`}
          value={selectedVal}
          onChange={(opt) => handleChange(level, opt)}
          isSearchable
        />
      </div>
    );
  };

  return (
    <>
      <div className="row">
        {hierarchyOrder.map((level, idx) => renderSelect(level, idx))}
      </div>
    </>
  );
};

export default HierarchySelect;
