
import { useState, useRef, useEffect } from "react";
import FilterWithButtonsCard from "../../Utils/FilterWithButtonsCard";
import getApiCall from "../../Services/getApiCall";
import postApiCall from "../../Services/postApiCall";
import Select from "react-select";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router";

export default function ForumForm() {
  const location = useLocation();
  const navigate = useNavigate();

  // ================= EXISTING =================
  const [box1, setBox1] = useState([

  ]);

  const [box2, setBox2] = useState([]);
  const [selected1, setSelected1] = useState([]);
  const [selected2, setSelected2] = useState([]);
  const [listedBy, setListedBy] = useState("ROLE");
  const [cityList, setCityList] = useState([])
  const [userRoleList, setUserRoleList] = useState([])
  const stateId = useRef();
  const cityId = useRef();

  const [request, setRequest] = useState({});

  const setRequ = (obj) => {
    const { name, value } = obj;
    setRequest(prev => ({ ...prev, [name]: value }));
  };

  // ================= NEW =================
  const [type, setType] = useState("NATIONAL");
  const [stateList, setStateList] = useState([]);
  const [cityMap, setCityMap] = useState({}); // stateCode → cities
  const [stateMap, setStateMap] = useState([]);
  const [forumName, setForumName] = useState('')
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [openStates, setOpenStates] = useState({});
  const [minimumUserConsensus, setMinimumUserConsensus] = useState(0)

  // toggle collapse
  const toggleState = async (state) => {
    const code = state.isoCode;

    // toggle UI
    setOpenStates(prev => ({ ...prev, [code]: !prev[code] }));

    // ✅ Load cities ONLY when expanding first time
    if (!cityMap[code]) {
      let res = await getApiCall(`admin/city/getAllForOption?isoCode=${code}`);
      if (res.meta.status) {
        setCityMap(prev => ({ ...prev, [code]: res.data }));
      }
    }
  };

  // ✅ Select ALL cities when state checked
  const handleStateWithCities = async (state) => {
    const code = state.isoCode;

    let isSelected = selectedStates.some(s => s.isoCode === code);

    let updatedStates;
    if (isSelected) {
      updatedStates = selectedStates.filter(s => s.isoCode !== code);
    } else {
      updatedStates = [...selectedStates, state];
    }
    setRequ({name:"forumStates", value:updatedStates.map(s => s.name)})
    setSelectedStates(updatedStates);

    // ✅ Ensure cities are loaded
    let cities = cityMap[code];
    if (!cities) {
      let res = await getApiCall(`admin/city/getAllForOption?isoCode=${code}`);
      if (res.meta.status) {
        cities = res.data;
        setCityMap(prev => ({ ...prev, [code]: cities }));
      }
    }

    let updatedCities = [...selectedCities];

    if (!isSelected) {
      // ✅ SELECT ALL cities
      cities.forEach(city => {
        if (!updatedCities.some(c => c._id === city._id)) {
          updatedCities.push(city);
        }
      });
    } else {
      // ✅ REMOVE ALL cities
      updatedCities = updatedCities.filter(
        c => !cities.some(city => city._id === c._id)
      );
    }
    setRequ({name:"forumCities", value:updatedCities.map(c => c.name)})
    setSelectedCities(updatedCities);
  };

  console.log('slectedStateCity::::', selectedStates, selectedCities)

  // ================= MOVE LOGIC =================
  const moveRight = () => {
    const selectedItems = box1.filter(item => selected1.includes(item._id));
    console.log('selectedItems::::', selectedItems, selected1, box1, box2)
    setBox2([...box2, ...selectedItems]);
    setBox1(box1.filter(item => !selected1.includes(item._id)));
    setSelected1([]);
  };

  const moveLeft = () => {
    const selectedItems = box2.filter(item => selected2.includes(item._id));
    setBox1([...box1, ...selectedItems]);
    setBox2(box2.filter(item => !selected2.includes(item._id)));
    setSelected2([]);
  };
  // const moveRight = () => {
  //   console.log('selected1::::::',selected1)
  //   setBox1(prevBox1 => {
  //     const selectedItems = prevBox1.filter(item =>
  //       selected1.includes(item._id)
  //     );

  //     setBox2(prevBox2 => {
  //       // جلوگیری duplicates (optional but recommended)
  //       const newItems = selectedItems.filter(
  //         item => !prevBox2.some(b => b._id === item._id)
  //       );
  //       return [...prevBox2, ...newItems];
  //     });

  //     return prevBox1.filter(item => !selected1.includes(item._id));
  //   });

  //   setSelected1([]);
  // };

  // const moveLeft = () => {
  //   setBox2(prevBox2 => {
  //     const selectedItems = prevBox2.filter(item =>
  //       selected2.includes(item._id)
  //     );

  //     setBox1(prevBox1 => {
  //       const newItems = selectedItems.filter(
  //         item => !prevBox1.some(b => b._id === item._id)
  //       );
  //       return [...prevBox1, ...newItems];
  //     });

  //     return prevBox2.filter(item => !selected2.includes(item._id));
  //   });

  //   setSelected2([]);
  // };
  const moveAllRight = () => {
    setBox2([...box2, ...box1]);
    setBox1([]);
  };

  const moveAllLeft = () => {
    setBox1([...box1, ...box2]);
    setBox2([]);
  };

  // ================= API =================
  const getStateMap = async () => {
    let res = await getApiCall("admin/state/getAll");
    if (res.meta.status) {
      setStateMap(res.data);
    }
  };

  const loadCities = async (states) => {
    let map = {};
    for (let s of states) {
      let res = await getApiCall(`admin/city/getAllForOption?isoCode=${s.isoCode}`);
      if (res.meta.status) {
        map[s.isoCode] = res.data;
      }
    }
    setCityMap(map);
  };

  const getRoleByUserList = async (value) => {
    let params = {
      listBy: listedBy,
      userRole: value,
      // userAutority: , 
      // state: ,
      // city :
    }
    let res = await getApiCall("admin/apf-flow/forum/get-user-list", params);
    if (res.meta.status) {
      const assignedIds = box2.map((u) => u._id);

// Step 2: filter unmatched users
const availableUsers = res.data.filter(
  (user) => !assignedIds.includes(user._id)
);
      setBox1(availableUsers);
    }
  };

  const getPertnerRole = async () => {
    let res = await getApiCall("admin/builder/execute/user-roles");
    if (res.meta.status) {
      setUserRoleList(res.data.map((user) => ({ label: user.roleName, value: user._id })));
    }
  }
  // ================= TYPE CHANGE =================
  useEffect(() => {
    setSelectedStates([]);
    setSelectedCities([]);
    setCityMap({});
    if (type === "REGIONAL" || type === "LOCAL") {
      getStateMap();
    }
  }, [type]);

  useEffect(() => {
    getPertnerRole()
  }, [])

  // useEffect(() => {
  //   if (location.state) {
  //     const { name, type, listBy } = location.state;
  //     setForumName(name || '')
  //     setType(type || '')
  //     setListedBy(listBy || 'ROLE')
  //     if (listBy === "ROLE") {
  //      setBox2(location.state.selectedUsers.map((user)=>({_id:user.userId, name:user.userName})) || [])
  //      setRequ({ name: "role", value: location.state.userRole || '' })
  //     }
  //     if (listBy === "REGIONAL" || listBy === "LOCAL") {
  //       // setSelectedStates(location.state.state || []);
  //       getStateMap();
  //       setRequ({name: "forumStates", value: location.state.state || []})
  //   }
  //     setMinimumUserConsensus(location.state.minimumUserConsensus || 0)
  //     console.log('location.state::::', location.state, name)
  //   }
  // }, [location.state])

  useEffect(() => {
  if (!location?.state) return;

  const {
    name,
    type,
    listBy,
    selectedUsers = [],
    userRole,
    state,
    city,
    minimumUserConsensus,
  } = location.state;

  // Basic fields
  setForumName(name || "");
  setType(type || "");
  setListedBy(listBy || "ROLE");
  setMinimumUserConsensus(minimumUserConsensus || 0);

  // ROLE based
  if (listBy === "ROLE") {
    const mappedUsers = selectedUsers.map((user) => ({
      _id: user.userId,
      name: user.userName,
    }));

    setBox2(mappedUsers);

    setRequ({
      name: "role",
      value: userRole || "",
    });
  }

  // REGIONAL / LOCAL
  if(type=="REGIONAL"){
 getStateMap();

    setRequ({
      name: "forumStates",
      value: state || [],
    });
  }else if (type === "LOCAL") {
    getStateMap();

    setRequ({
      name: "forumStates",
      value: state || [],
    });
        setRequ({
      name: "forumCities",
      value: city || [],
    });
  }

  console.log("location.state::::", location.state);
}, [location?.state]);
  // ================= STATE SELECT =================
  const handleStateChange = async (state) => {
    let updated;

    if (selectedStates.some(s => s.name === state.name)) {
      updated = selectedStates.filter(s => s.name !== state.name);
    } else {
      updated = [...selectedStates, state];
    }

    setSelectedStates(updated);
    setRequest({ ...request, forumStates: updated.map(s => s.name) });

    if (type === "local") {
      await loadCities(updated);
    }
  };

  // ================= CITY SELECT =================
  // const handleCityChange = (city, state) => {
  //   let updated;

  //   if (selectedCities.some(c => c._id === city._id)) {
  //     updated = selectedCities.filter(c => c._id !== city._id);
  //   } else {
  //     updated = [...selectedCities, city];
  //   }

  //   const filteredStateByCity = stateList.filter(s => s.cityId === city._id);

  //   setSelectedCities(updated);
  //   setRequ({ name: "forumCities", value: updated.map(c => c.name) });
  //   // setRequ({ name: "forumState", value: state.name });
  // };
  const handleCityChange = (city) => {
    let updated;

    // Toggle city selection
    if (selectedCities.some((c) => c._id === city._id)) {
      updated = selectedCities.filter((c) => c._id !== city._id);
    } else {
      updated = [...selectedCities, city];
    }

    // ✅ Extract unique stateCodes
    const stateCodes = [...new Set(updated.map((c) => c.stateCode))];

    // ✅ Match states from stateList
    const matchedStates = stateMap.filter((state) =>
      stateCodes.includes(state.isoCode)
    );

    // ✅ Extract names (or use stateCode if needed)
    const stateNames = matchedStates.map((s) => s.name);
    console.log('updated::::::', updated, stateNames, stateCodes, stateMap);
    // Update states
    setSelectedCities(updated);

    setRequest((prev) => ({
      ...prev,
      forumCities: updated.map((c) => c.name),
      forumStates: stateNames,
    }));
  };

  async function getState() {
    let response = await getApiCall('admin/state/getAll');
    if (response.meta.status == true) setStateList(response.data.map(_ => {
      return { value: _.isoCode, label: _.name }
    }))
    setStateList(old => [{ value: "", label: "Choose States" }, ...old])
  }

  const stateHandler = (selectedObj) => {
    if (selectedObj) {
      console.log("GET STATES")
      GetCity(selectedObj);
    }
  }

  const GetCity = async (selectedObj) => {
    if (selectedObj) {
      const { value, label } = selectedObj
      let response = await getApiCall(`admin/city/getAllForOption?isoCode=${value}`);
      if (response.meta.status == true) setCityList(response.data.map(_ => {
        return { value: _._id, label: _.name }
      }))
      setRequ({ name: "stateId", value })
      setRequ({ name: "stateName", value: label })
    }
  }
  function cityHandler(selectedObj) {
    if (selectedObj) {
      console.log("selectedObj", selectedObj)
      const { value, label } = selectedObj
      setRequ({ name: "cityId", value })
      setRequ({ name: "cityName", value: label })
    }
  }

  const handleSubmit = async () => {
      try {
    let payload = {
      forumName: forumName,
      forumType: type,
      forumState: (type=="REGIONAL" || type=="LOCAL") ? request.forumStates : undefined,
      forumCity: type=="LOCAL"?request.forumCities : undefined,
      listBy: listedBy,
      userRole: request.role,
      userAuthority: request.userAuthority,
      userState: request.userStateName,
      userCity : request.userCityName,
      selectedUsers: box2.map((u) => ({ userId: u._id, userName: u.name })),
      minimumUserConsensus: minimumUserConsensus,
    }
    let url=''
    if(location?.state?._id){ 
      url=`admin/apf-flow/forum/update-forum/${location.state._id}`
    }
    else{
      url=`admin/apf-flow/forum/create-forum`
    }

    let response = await postApiCall(url, payload);
    if (response.meta.status) {
      toast.success(response.meta.msg)
      navigate(-1)
    }
    else{
      toast.error(response.meta.msg)
    }
  } catch (err) {
    console.error('Validation or submission error:', err);
    toast.error('An unexpected error occurred during submission.');
   }
  }
const selectedCityMap={}
  const isAllCitiesSelected = (state) => {
    console.log('isAllCitiesSelected::::', state)
    const cities = selectedCityMap[state.isoCode] || [];
    return (
      cities.length > 0 &&
      cities.every((city) =>
        request.forumCities.includes(city.name)
      )
    );
  };

  // ✅ Check if some cities selected
  const isSomeCitiesSelected = (state) => {
    console.log('isSomeCitiesSelected::::', state)
    const cities = selectedCityMap[state.isoCode] || [];
    const selected = cities.filter((city) =>
      request.forumCities.includes(city.name)
    );
    return selected.length > 0 && selected.length < cities.length;
  };
  console.log('selectedStates::::::',selectedStates, request)
  // ================= UI =================
  return (
    <div className="container-fluid mt-4">
      <div className="main-title">
        <FilterWithButtonsCard title="Forum Form" />
      </div>

      <div className="card p-4 shadow-sm">

        <div className="row">

          {/* Name */}
          <div className="col-md-4 mb-3">
            <label className="font-weight-bold">Name</label>
            <input className="form-control" value={forumName} name="forumName" onChange={(e) => setForumName(e.target.value)} />
          </div>

          {/* Type */}
          <div className="col-md-4 mb-3">
            <label className="font-weight-bold">Type</label>
            <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Select</option>
              <option value="NATIONAL">National</option>
              <option value="REGIONAL">Regional</option>
              <option value="LOCAL">Local</option>
            </select>
          </div>
        </div>
                {/* ================= REGIONAL ================= */}
        {type === "REGIONAL" && (
          <div className="mt-3">
            <label className="font-weight-bold">Select States</label>
            <div className="row p-0">
              {stateMap.map(state => (
                <div className="col-md-12" key={state.name}>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      checked={request?.forumStates?.some(s => s == state.name)}
                      onChange={() => handleStateChange(state)}
                    />
                    <label className="ms-1 mx-1" style={{ fontSize: "14px", fontWeight: 600 }}>{state.name}</label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= LOCAL ================= */}
        {type === "LOCAL" && (<>
          <div className="card mt-3">
            <label className="font-weight-bold mx-2 mt-2">Select State/City*</label>

            {/* {stateMap.map(state => (<>
              {/* ✅ CARD HEADER (STATE) 
              <div className="card-header p-2" style={{ height: '34px', borderBottom: 0 }} key={state.isoCode}>
                <div className="d-flex align-items-center">

                  {/* Toggle Icon 
                  <span
                    className="me-2 form-check"
                    onClick={() => toggleState(state)}

                  >
                    <i
                      className={`bi ${openStates[state.isoCode]
                        ? "bi-chevron-down"
                        : "bi-chevron-right"
                        }`}
                      style={{
                        fontSize: "18px",
                        WebkitTextStroke: "1.5px"
                      }}
                    ></i>
                  </span>

                  {/* Checkbox + Label 
                  <div>
                    <input
                      type="checkbox"
                      className="me-2 mr-1"
                      checked={request?.forumCities?.some(
                        s => s === state.name
                      )}
                      onChange={() => handleStateWithCities(state)}
                    />
                    <span style={{ fontSize: "14px", fontWeight: 600 }}>
                      {state.name}
                    </span>
                  </div>

                </div>
              </div>

              {/* ✅ CARD BODY (CITIES) 
              {openStates[state.isoCode] && (
                <div
                  className="card-body"
                  style={{ padding: '0px 36px' }}
                >
                  {cityMap[state.isoCode]?.length ? (<>
                    {/* <div className="row"> 
                    {cityMap[state.isoCode].map(city => (
                      <div className="mb-0 form-check" key={city._id}>
                        <input
                          type="checkbox"
                          className="mx-1"

                          checked={request?.forumCities?.some(
                            c => c === city.name
                          )}
                          onChange={() => handleCityChange(city,state)}
                        />
                        <span style={{ fontSize: "14px", fontWeight: 600 }}> {city.name}</span>
                      </div>
                    ))}
                    {/* </div> 
                  </>) : (
                    <div className="text-muted">Loading cities...</div>
                  )}
                </div>
              )}


            </>))} */}

            {stateMap.map((state) => (
        <div key={state.isoCode} className="card mb-2">
          {/* STATE HEADER */}
          <div
            className="card-header p-2 d-flex align-items-center"
            style={{ height: "40px" }}
          >
            {/* Toggle */}
            <span
              className="me-2"
              onClick={() => toggleState(state)}
              style={{ cursor: "pointer" }}
            >
              <i
                className={`bi ${
                  openStates[state.isoCode]
                    ? "bi-chevron-down"
                    : "bi-chevron-right"
                }`}
              ></i>
            </span>

            {/* Checkbox */}
            <input
              type="checkbox"
              className="me-2"
              checked={isAllCitiesSelected(state)}
              ref={(el) => {
                if (el) {
                  el.indeterminate = isSomeCitiesSelected(state);
                }
              }}
              onChange={() => handleStateWithCities(state)}
            />

            <strong>{state.name}</strong>
          </div>

          {/* CITY LIST */}
          {openStates[state.isoCode] && (
            <div className="card-body">
              {cityMap[state.isoCode]?.map((city) => (
                <div key={city._id} className="form-check">
                  <input
                    type="checkbox"
                    className="me-2"
                    checked={request?.forumCities?.includes(city.name)}
                    onChange={() => handleCityChange(city)}
                  />
                  {city.name}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}


          </div>
        </>)}
        <div className="row">
          <div className="mb-3 col-md-4">
            <label className="font-weight-bold">Listed User By</label>
            <div>

              <label className="mx-2">
                <input
                  type="radio"
                  name="listedBy"
                  value="ROLE"
                  checked={listedBy == "ROLE"}
                  className="me-1 mr-1"
                  onChange={(e) => { setListedBy(e.target.value); getPertnerRole() }}
                />
                Role
              </label>

              <label className="mx-2">
                <input
                  type="radio"
                  name="listedBy"
                  checked={listedBy == "AUTHORITY"}
                  value="AUTHORITY"
                  className="me-1 mr-1"
                  onChange={(e) => setListedBy(e.target.value)}
                />
                Authority
              </label>

              <label className="me-2">
                <input
                  type="radio"
                  name="listedBy"
                  checked={listedBy == "CITY"}
                  value="CITY"
                  className="me-1 mr-1"
                  onChange={(e) => {
                    setListedBy(e.target.value);
                    getState(); // load states
                  }}
                />
                City
              </label>

            </div>
          </div>
          {listedBy === "ROLE" && (
            <div className="col-md-4">
              <label className="font-weight-bold">Select User Role</label>
              <Select
                options={userRoleList}
                value={request.role ? userRoleList.find(r => r.value === request.role) : null}
                onChange={(e) => { setRequ({ name: "role", value: e.value }); getRoleByUserList(e.label) }}
              />
            </div>
          )}
          {/* Authority */}
          {listedBy === "AUTHORITY" && (
            <div className="col-md-4">
              <label className="font-weight-bold">User Authority*</label>
              <Select
                options={[...Array(6)].map((_, i) => ({ label: "L" + i, value: "L" + i }))}
                onChange={(e) => setRequ({ name: "userAuthority", value: e.value })}
                value={request.userAuthority ? [...Array(6)].map((_, i) => ({ label: "L" + i, value: "L" + i })).find(r => r.value === request.userAuthority) : null}
              />
            </div>
          )}

          {listedBy === "CITY" && (
            <>
              {/* STATE SINGLE SELECT */}
              <div className="col-md-4">
                <label className="font-weight-bold">Choose State*</label>
                <Select
                  options={stateList}
                  value={stateList.find(s => s.label === request.userStateName) || null}
                  onChange={async (selected) => {
                    if (!selected) return;

                    const { value, label } = selected;

                    // set state
                    // setRequ({ name: "stateId", value });
                    setRequ({ name: "userStateName", value: label });

                    // reset city
                    // setRequ({ name: "cityId", value: "" });
                    setRequ({ name: "userCityName", value: "" });

                    // load cities
                    let res = await getApiCall(
                      `admin/city/getAllForOption?isoCode=${value}`
                    );

                    if (res.meta.status) {
                      setCityList(
                        res.data.map(c => ({
                          value: c._id,
                          label: c.name
                        }))
                      );
                    }
                  }}
                />
              </div>

              {/* CITY SINGLE SELECT */}
              <div className="col-md-4">
                <label className="font-weight-bold">Choose City*</label>
                <Select
                  options={cityList}
                  value={cityList.find(c => c.label === request.userCityName) || null}
                  onChange={(selected) => {
                    if (!selected) return;

                    const { value, label } = selected;

                    // setRequ({ name: "cityId", value });
                    setRequ({ name: "userCityName", value: label });
                  }}
                  isDisabled={!request.stateId} // disable until state selected
                />
              </div>
            </>
          )}
        </div>

        {/* ================= DUAL LIST ================= */}
        <div className="row mt-4">

          <div className="col-md-5">
            <label className="font-weight-bold">Available Users</label>
            <select multiple className="form-control" style={{ height: "200px" }}
              onChange={(e) => {
                console.log('selectedOptions::::', e.target.selectedOptions)
                setSelected1([...e.target.selectedOptions].map(o => o.value))
              }
              }>
              {box1.map(item => (
                <option key={item._id} value={item._id}>{item.name}</option>
              ))}
            </select>
          </div>

          <div className="col-md-2 d-flex flex-column justify-content-center align-items-center">
            <button className="btn btn-primary mb-2" onClick={moveRight}>&gt;</button>
            <button className="btn btn-outline-primary mb-2" onClick={moveAllRight}>&gt;&gt;</button>
            <button className="btn btn-primary mb-2" onClick={moveLeft}>&lt;</button>
            <button className="btn btn-outline-primary" onClick={moveAllLeft}>&lt;&lt;</button>
          </div>

          <div className="col-md-5">
            <label className="font-weight-bold">Selected Users</label>
            <select multiple className="form-control" style={{ height: "200px" }}
              onChange={(e) =>
                setSelected2([...e.target.selectedOptions].map(o => o.value))
              }>
              {box2.map(item => (
                <option key={item._id} value={item._id}>{item.name}</option>
              ))}
            </select>
          </div>
          <div className="mt-4 col-md-4">
            <label className="font-weight-bold">Minium User Consensue *</label>
            <select className="form-control" value={minimumUserConsensus} onChange={(e) => setMinimumUserConsensus(e.target.value)}>
              <option value="">Select</option>
              {[...Array(Number(box2.length))].map((_, num) => (
                <option value={num + 1}>{num + 1}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-4 text-end">
          <button className="btn btn-success" onClick={handleSubmit}>Submit</button>
        </div>

      </div>
    </div>
  );
}