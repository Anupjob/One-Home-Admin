import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Handle,
  Position,
  getSmoothStepPath,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import './workflowCanvas.css';
import getApiCall from '../../Services/getApiCall';
import postApiCall from '../../Services/postApiCall';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import {toast, ToastContainer} from "react-toastify";
import { useNavigate, useParams, useLocation } from 'react-router';
import RuleModal from './RuleModal';
import OvalModal from './OvalModal';
import CreatableSelect from "react-select/creatable";
import IconSelector from '../FormBuilder/IconSelector';
import CustomButton from '../../Utils/CustomButton';
import CommonActionIcons from '../../Utils/CommonActionIcons';

// Auto-ID generator
let idCounter = 1;
const getId = () => `${idCounter++}`;

// --- Custom Edge with Arrow and Circle ---
const OrangeArrowEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 0,
  });

  return (
    <>
      <defs>
        <marker
          id="arrow-orange"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#EE5819" />
        </marker>
        <marker
          id="circle-orange"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto"
        >
          <circle cx="5" cy="5" r="3" fill="#EE5819" />
        </marker>
      </defs>

      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={{ stroke: '#EE5819', strokeWidth: 2 }}
        markerStart="url(#circle-orange)"
        markerEnd="url(#arrow-orange)"
      />
    </>
  );
};

// --- Custom Handles and Nodes ---
const CustomHandle = ({ type, position, style = {} }) => (
  <Handle type={type} position={position} style={{ background: 'transparent', ...style, border:'0px' }} />
);

const DiamondNode = ({ data, id }) => {
  const { getNodes } = useReactFlow();
  const nodes = getNodes()
  console.log('diamond nodes::::::',nodes, data)
  const [isHovering, setIsHovering] = useState(false);
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const [role, setRole] = useState(data.role || "Rule");
  const [open, setOpen] = useState(false);
  const [rules, setRules] = useState(data.compareRules?{ ...data.compareRules,
    userAssignment:{...data?.compareRules?.userAssignment,
    creatorAssignmentType:data?.compareRules?.userAssignment?.creatorAssignmentType||'Single',
      approverAssignmentType:data?.compareRules?.userAssignment?.approverAssignmentType||'Single',
    }
  } : {
    combinator: "and",
    rules: [],
    selectedFields:[],
    userAssignment:{
      creatorUserKey: '',
      creatorFormId: '',
      approverUserKey: '',
      approverFormId: '',
      creatorAssignmentType:'Single',
      approverAssignmentType:'Single',
    }
  });

  useEffect(() => {
    data.label = label;
    data.role = role;
    data.compareRules = rules;
  }, [label, role, rules]);

  return (
    <div
      className="position-relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setTimeout(() => setIsHovering(false), 150)} // slight delay for smoother exit
      style={{
        display: "inline-block",
        textAlign: "center",
      }}
    >
      {/* Diamond Shape */}
      <div
        style={{
          width: 30,
          height: 30,
          backgroundColor: "#EE5819",
          transform: "rotate(45deg)",
          border: "2px solid white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
          left: 40, // space for hover menu below
        }}
        onMouseEnter={() => setIsHovering(true)} // keep hover active when on diamond
      >
        <div style={{ transform: "rotate(-45deg)", textAlign: "center" }}>
          {editing ? (
            <>
              <input
                className="form-control form-control-sm mb-1"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Label"
              />
              <input
                className="form-control form-control-sm"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Role"
              />
              <button
                className="btn btn-sm btn-light mt-1"
                onClick={() => setEditing(false)}
              >
                Save
              </button>
            </>
          ) : (
            <div>{id}</div>
          )}
        </div>

        {/* Handles */}
        <CustomHandle type="target" position={Position.Left} style={{ top: "100%" }} />
        <CustomHandle type="source" position={Position.Right} style={{ top: "0%" }} />
      </div>

      {/* Hover Menu - Appears Below Diamond */}
      {isHovering && (
        <div
          className="position-absolute start-50 translate-middle-x d-flex gap-3 bg-white p-2 rounded shadow-sm"
          style={{
            top: "60%", // position below diamond
            transform: "translate(-15%, 10px)",
            zIndex: 10,
          }}
          onMouseEnter={() => setIsHovering(true)} // keep open when hovering menu
          onMouseLeave={() => setIsHovering(false)} // close only when leaving both
        >

          <div
            title="Settings"
            onClick={() => setOpen(true)}
            className="icon-hover"
          >
            <i className="bi bi-gear"></i>
          </div>

          <div
            title="Delete"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("delete-node", { detail: { id } })
              )
            }
            className="icon-hover"
          >
            <i className="bi bi-trash3"></i>
          </div>

        </div>
      )}

      {/* Rule Modal */}
      {open&&
      <RuleModal
        open={open}
        setOpen={setOpen}
        nodeId={data.SourceId}
        moduleId={"68e374e67a3164f07cb8fde8"}
        rules={rules}
        setRules={setRules}
        nodes={nodes}
      />
}
    </div>
  );
};

const RectNode = ({ data, id }) => {
  console.log('data::::::::',data, id)
  const [hover, setHover] = useState(false);
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const [role, setRole] = useState(data.role || 'Role');

  useEffect(() => {
    data.label = label;
    data.role = role;
  }, [label, role]);

  return (
<div
  className="position-relative d-inline-block"
  onMouseEnter={() => setHover(true)}
  onMouseLeave={() => setHover(false)}
>
  {/* Node Box */}
  <div className="bg-primary text-white p-2 rounded" style={{ minWidth: 90, height: 40, textAlign: 'center', fontWeight: '600' }}>
    {editing ? (
      <>
        <input
          className="form-control form-control-sm mb-1"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <input
          className="form-control form-control-sm"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <button className="btn btn-sm btn-light mt-1" onClick={() => setEditing(false)}>Save</button>
      </>
    ) : (
      <div>{label}</div>
    )}
    <CustomHandle type="target" position={Position.Left} />
    <CustomHandle type="source" position={Position.Right} />
  </div>

  {/* Hover Container */}
  {hover && (
    <div
      className="position-absolute start-50 translate-middle-x d-flex gap-3 bg-white p-1 rounded shadow-sm"
      style={{ top: '105%' }}
    >
      {/* <div title="Connect" onClick={() => setEditing(true)} className="icon-hover">
        <i className="bi bi-arrow-90deg-right"></i>
      </div> */}
      {/* <div title="Edit" onClick={() => setEditing(true)} className="icon-hover">
        <i className="bi bi-gear"></i>
      </div> */}
      <div
        title="Delete"
        onClick={() => window.dispatchEvent(new CustomEvent('delete-node', { detail: { id } }))}
        className="icon-hover"
      >
        <i className="bi bi-trash3"></i>
      </div>
      {/* <div
        title="Copy"
        onClick={() => window.dispatchEvent(new CustomEvent('copy-node', { detail: { id } }))}
        className="icon-hover"
      >
        <i className="bi bi-copy"></i>
      </div> */}
    </div>
  )}
</div>

  );
};

// --- Oval Node Component ---
const OvalNode = ({ data, id }) => {
  const { getNodes } = useReactFlow();
  const nodes = getNodes()
  console.log('oval nodes::::::',nodes)
  const [isHovering, setIsHovering] = useState(false);
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const [role, setRole] = useState(data.role || "Rule");
  const [open, setOpen] = useState(false);
  const [rules, setRules] = useState(data.compareRules || {
    combinator: "and",
    rules: [],
    selectedFields:[],
    userAssignment:{
      creatorUserKey: '',
      creatorFormId: '',
      approverUserKey: '',
      approverFormId: '',
    }
  });

  useEffect(() => {
    data.label = label;
    data.role = role;
    data.compareRules = rules;
  }, [label, role, rules]);

  return (
    <div
      className="position-relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setTimeout(() => setIsHovering(false), 150)}
      style={{
        display: "inline-block",
        textAlign: "center",
      }}
    >
      {/* Oval Shape */}
      <div
        style={{
          width: 65,
          height: 45,
          backgroundColor: "#EE5819",
          borderRadius: "50%",
          border: "2px solid white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
          position: "relative",
        }}
        onMouseEnter={() => setIsHovering(true)}
      >
        <div style={{ textAlign: "center" }}>
          {editing ? (
            <>
              <input
                className="form-control form-control-sm mb-1"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Label"
              />
              <input
                className="form-control form-control-sm"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Role"
              />
              <button
                className="btn btn-sm btn-light mt-1"
                onClick={() => setEditing(false)}
              >
                Save
              </button>
            </>
          ) : (
            <div>{id}</div>
          )}
        </div>

        {/* Multiple Target Handles for Multiple Sources */}
        <CustomHandle type="target" position={Position.Left} style={{ top: "25%" }} />
        <CustomHandle type="target" position={Position.Left} style={{ top: "50%" }} />
        <CustomHandle type="target" position={Position.Left} style={{ top: "75%" }} />
        
        {/* Single Source Handle for Destination */}
        <CustomHandle type="source" position={Position.Right} style={{ top: "50%" }} />
      </div>

      {/* Hover Menu - Appears Below Oval */}
      {isHovering && (
        <div
          className="position-absolute start-50 translate-middle-x d-flex gap-3 bg-white p-2 rounded shadow-sm"
          style={{
            top: "100%",
            transform: "translate(-15%, 10px)",
            zIndex: 10,
            top: "80%",
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >

          <div
            title="Settings"
            onClick={() => setOpen(true)}
            className="icon-hover"
          >
            <i className="bi bi-gear"></i>
          </div>

          <div
            title="Delete"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("delete-node", { detail: { id } })
              )
            }
            className="icon-hover"
          >
            <i className="bi bi-trash3"></i>
          </div>

        </div>
      )}

      {/* Oval Modal */}
      {open&&
      <OvalModal
        open={open}
        setOpen={setOpen}
        nodeId={data.SourceId}
        moduleId={"68e374e67a3164f07cb8fde8"}
        rules={rules}
        setRules={setRules}
        nodes={nodes}
      />
}
    </div>
  );
};

const nodeTypes = {
  diamond: DiamondNode,
  oval: OvalNode,
  rect: RectNode,
};

const edgeTypes = {
  orangeArrow: OrangeArrowEdge,
};

export default function WorkflowCanvas() {
  const {type} = useParams()
  const navigate = useNavigate()
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const wofId = params.get('wofId');
  const wrapperRef = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [moduleList, setModuleList] = useState([])
  const [open, setOpen] = useState(false);
  const [searchKey, setSearchKey] =useState('')
  const [pageNo, setPageNo] = useState(1)
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [showEdit, setShowEdit] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    parentName: '',
    orderNumber: '',
    icon: "bi-alarm",
  })
  const [formsData, setFormsData] = useState()
  const [selectedForm, setSelectedForm] = useState("");
  const [search, setSearch] = useState("");
  const [selectedFields, setSelectedFields] = useState({});
  const currentForm = formsData?.find(f => f.formId === selectedForm);
  const [stages, setStages] = useState([]);
  const [stageOpen, setStageOpen] = useState(false);
  const [stageEdit, setStageEdit] = useState(false);
  const [stageData, setStageData] = useState({ stageId: '', stageName: '', formsId: '' });
  const [userData, setUserData] = useState({ createUsers: [], approveUsers: [] });
  // Forms that can be assigned to the currently edited stage (excluding forms already assigned to other stages)
  const availableStageForms = useMemo(() => {
    const currentStageId = stageData?.stageId;
    return (formsData || []).filter((f) => {
      return !stages.some((s) => {
        const ids = Array.isArray(s.formsId) ? s.formsId : s.formsId ? [s.formsId] : [];
        return ids.includes(f.formId) && String(s.stageId) !== String(currentStageId);
      });
    });
  }, [formsData, stages, stageData?.stageId]);
  const toggleField = (formId, fieldKey) => {
    setSelectedFields(prev => {
      const existing = prev[formId] || [];

      return {
        ...prev,
        [formId]: existing.includes(fieldKey)
          ? existing.filter(k => k !== fieldKey)
          : [...existing, fieldKey]
      };
    });
  };
  console.log('selectedFieldsL::::::;',selectedFields)
  const filteredFields =
    currentForm?.fields?.filter(f =>
      f.label.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const getSelectedResults = () => {
    return Object.entries(selectedFields).map(([formId, fields]) => ({
      formId,
      fields: Array.isArray(fields) ? fields : [],
    }));
  };

    const arrayToSelectedFieldsMap = (arr = []) =>
    (arr || []).reduce((acc, item) => {
      if (!item || !item.formId) return acc;
      acc[item.formId] = Array.isArray(item.fields) ? item.fields : [];
      return acc;
    }, {});
  const buildResults = (map) =>
    Object.entries(map)
      .filter(([, fields]) => Array.isArray(fields) && fields.length > 0)
      .map(([formId, fields]) => ({ formId, fields }));

  const totalSelected = Object.values(selectedFields)
    .reduce((acc, arr) => acc + arr.length, 0);

  const onConnect = useCallback(({ source, target }) => {
    const sourceNode = nodes.find((n) => n.id === source);
    const targetNode = nodes.find((n) => n.id === target);
    if (!sourceNode || !targetNode) return;

    // Find edges that are already connected to the target
    const incomingEdgesToTarget = edges.filter((edge) => edge.target === target);
    
    // If there's already an intermediate rule node, upgrade diamond to oval and connect the new source
    if (incomingEdgesToTarget.length > 0) {
      // Find the intermediate node (the rule node)
      const intermediateNodeId = incomingEdgesToTarget[0].source;
      const intermediateNode = nodes.find((n) => n.id === intermediateNodeId);
      
      // If it's a diamond node, replace it with an oval
      if (intermediateNode && intermediateNode.type === 'diamond') {
        // Change the intermediate node from diamond to oval
        setNodes((nds) =>
          nds.map((n) =>
            n.id === intermediateNodeId ? { ...n, type: 'oval' } : n
          )
        );
      }
      
      // Add new edge from current source to the intermediate node
      setEdges((eds) => [
        ...eds,
        { id: `${source}-${intermediateNodeId}`, source, target: intermediateNodeId, type: 'orangeArrow' },
      ]);
      return;
    }

    // First connection: create a diamond node
    const midX = (sourceNode.position.x + targetNode.position.x) / 2;
    const midY = (sourceNode.position.y + targetNode.position.y) / 2;

    const ruleNodeId = getId();
    const ruleNode = {
      id: ruleNodeId,
      type: 'diamond',
      position: { x: midX, y: midY },
      data: { label: 'Rule', role: 'Auto Inserted', SourceId: sourceNode.data.formId, formLists:formsData, },
    };
console.log('source::::::',sourceNode, 'Creating diamond node for first connection')
    setNodes((nds) => [...nds, ruleNode]);
    setEdges((eds) => [
      ...eds,
      { id: `${source}-${ruleNodeId}`, source, target: ruleNodeId, type: 'orangeArrow' },
      { id: `${ruleNodeId}-${target}`, source: ruleNodeId, target, type: 'orangeArrow' },
    ]);
  }, [nodes, edges]);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const bounds = wrapperRef.current.getBoundingClientRect();
    const data = JSON.parse(event.dataTransfer.getData('application/reactflow'));
    const position = reactFlowInstance.project({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });

    const newNode = {
      id: getId(),
      type: data.type,
      position,
      data: { label: data.name, role: 'New', formId: data._id },
    };
    setNodes((nds) => [...nds, newNode]);
    console.log('ondrop:::::::')
  }, [reactFlowInstance]);

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };


console.log('edgeTypes:::::::',nodes,edges, reactFlowInstance, wrapperRef)
  useEffect(() => {
    if(type=="edit" || type=="view"){
      getFormDataById()
      if(type=="edit"){
      getAllFormList()
      }
    }else if(type=="add"){
      handleFormSetting()
    }
    const del = (e) => {
      const id = e.detail.id;
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((ed) => ed.source !== id && ed.target !== id));
    };
    window.addEventListener('delete-node', del);
    return () => window.removeEventListener('delete-node', del);
  }, []);

  useEffect(() => {
    const copy = (e) => {
      const node = nodes.find((n) => n.id === e.detail.id);
      if (!node) return;
      const newNode = {
        ...node,
        id: getId(),
        position: { x: node.position.x + 40, y: node.position.y + 40 },
      };
      setNodes((nds) => [...nds, newNode]);
    };
    window.addEventListener('copy-node', copy);
    return () => window.removeEventListener('copy-node', copy);
  }, [nodes]);


  function getList() {
  if (loading || !hasMore) return;

  setLoading(true);

  let params = {
    searchKey,
    contentPerPage: 10,
    page: pageNo
  };

  getApiCall('admin/dynamic/form/list', params)
    .then((response) => {
      if (response.meta.status) {
        const { pages, data } = response;

        setTotalPages(pages);

        const formattedData = data.map((item) => ({
          ...item,
          type: "rect",
        }));

        setModuleList((prev) => [...prev, ...formattedData]);

        if (pageNo >= pages) {
          setHasMore(false);  // No more pages
        }
      } else {
        setHasMore(false);
      }
    })
    .catch(() => setHasMore(false))
    .finally(() => setLoading(false));
}
  function getAllFormList() {
    getApiCall(`admin/workflow/forms-with-fields/${wofId}`)
      .then((response) => {
        if (response.meta.status) {
          setFormsData(response.data.forms);
        }
      })
      .catch((error) => {
        console.error("Error loading form data:", error);
      });
  }


const handleScroll = (e) => {
  const reachBottom =
    e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 1;

  if (reachBottom && hasMore && !loading) {
    setPageNo((prev) => prev + 1);
  }
};

useEffect(() => {
  getList();
}, [pageNo]);

  const getFormDataById = () => {
          getApiCall(`admin/workflow/details/${wofId}`)
              .then((response) => {
                  if (response.meta.status) {
                      setFormData({
                          name: response.data.name,
                          orderNumber: response.data.orderNumber || '',
                          parentName: response.data.parentName || '',
                          icon: response.data.icon || 'bi-alarm', 
                      });
                      setNodes( response.data.nodes)
                      setEdges( response.data.edges)
                      if(response.data.workflowTableSettings?.length>0){
                        setSelectedForm(response.data.workflowTableSettings[0].formId)
                        setSelectedFields(arrayToSelectedFieldsMap(response.data.workflowTableSettings) || {});
                      }
                      if(response.data.workflowStageSettings?.length>0){
                        setStages(response.data.workflowStageSettings)
                      }
                      idCounter = Math.max(...response.data.nodes.map(i => Number(i.id))) + 1;
                  }
              })
              .catch((error) => {
                  console.error("Error loading form data:", error);
              });
      };
      const handleFormSetting=()=>{
        setOpen(true)
    }
      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((values) => ({ ...values, [name]: value }));
    };
        const handleClose = (value) => {
        setOpen(false);
    };


    const handleSubmit = (event) => {
      event.preventDefault();
      let payload = {
        name: formData.name,
        // parentName: formData.parentName,
        // orderNumber: formData.orderNumber,
        description: formData.name,
        nodes: nodes,
        edges: edges,
        workflowTableSettings: getSelectedResults() || [],
        workflowStageSettings: stages.map((stg)=>({
          stageName: stg.stageName,
          stageId: stg.stageId,
          formsId: Array.isArray(stg.formsId) ? stg.formsId : stg.formsId ? [stg.formsId] : [],
          ownerUserId: stg?.ownerUserId || stg?.ownerDetails?.userId || '',
          ownerUserFormId: stg?.ownerUserFormId || stg?.ownerDetails?.formId || '',
          ownerUserSelectType: stg?.ownerUserSelectType || stg?.ownerDetails?.selectType || '',
        })) || [],
      }

      let url='admin/workflow/add'
      if(type=="edit"){
        url=`admin/workflow/update/${wofId}`
      }
            postApiCall(url, payload)
            .then(data => {
            if(data.meta.status ) {
                toast.success( data.meta.msg)
                navigate(-1)
            }
            else{
                toast.error(data.meta.msg);
                return false;
            }
        }).catch(error => {
            let { data } = error;
             toast.error(data.message);
            return false;
        });
    }

const handleSearch = () => {
  setPageNo(1);
  setModuleList([]);
  getList();
  setHasMore(true)
};

const handleClear = () => {
  setSearchKey("");
  setHasMore(true)
};
useEffect(() => {
  if (searchKey === "") {
    setPageNo(1);
    setModuleList([]);
    getList();
  }
}, [searchKey]);
  const handleIconSelect = (icon) => {
    setFormData({ ...formData, icon });
  };

    const toggleStageForm = (formId) => {
      setStageData(prev => {
      const prevIds = Array.isArray(prev.formsId) ? prev.formsId : (prev.formsId ? [prev.formsId] : []);
      const exists = prevIds.includes(formId);
      const newFormIds = exists ? prevIds.filter(id => id !== formId) : [...prevIds, formId];

      return {
        ...prev,
        formsId: newFormIds,
      };
      });
    };

  const handleAddStage = () => {
    const nextStageId = (() => {
      if (!stages || stages.length === 0) return '1';
      const nums = stages.map(s => Number(s.stageId) || 0);
      return String(Math.max(...nums) + 1);
    })();

    setStageData({ stageId: nextStageId, stageName: '', formsId: '' });
    setStageOpen(open);
  };

  console.log("ddd111 stage data = ",stageData);
  console.log("ddd111 stages = ",stages);

  
    const getAssignUserList = async (formId) => {
      try {
        const response = await getApiCall(
          `admin/submit/form/get-eligible-users?formId=${formId}&type=approve`
        );
  
        if (response.meta?.status) {
          const createUsers = response.data.createUsers || [];
          const approveUsers = response.data.approveUsers || [];
          setUserData({ createUsers, approveUsers });
        }
      } catch (error) {
        console.error("Error fetching eligible users:", error);
      } finally {
      }
    };

  return (<>
    <ReactFlowProvider>
      <div className="d-flex flex-column" style={{height:"calc(100vh - 50px)"}}>
        <div className="py-3 d-flex align-items-center justify-content-between" style={{ backgroundColor: '#EE5819', color: 'white', height: '50px' }}>
          {/* Left: Title */}
          <div className="fw-bold pl-4" style={{ fontSize: '1.25rem' }}>
            Workflow Design
          </div>
{type!=="view"&&(<>
          {/* Center: Buttons */}
          <div className="d-flex align-items-center gap-3 pr-3">
            {/* <button className="btn btn-orange btn-sm">SETTINGS</button> */}
            <button className="btn btn-primary btn-md no-hover" onClick={handleSubmit}>PUBLISH</button>
           <button className="btn btn-primary mx-1" onClick={()=>handleFormSetting()}><i className="bi bi-gear"></i></button>
          </div>
</>)}
          {/* Right: Undo, Redo, Divider, Preview Toggle */}
          {/* <div className="d-flex align-items-center gap-3">
            <button className="btn btn-link text-white p-0" title="Undo">
              <i className="bi bi-arrow-counterclockwise fs-4 fw-bold" style={{fontSize:24, fontWeight:800}}></i>
            </button>
            <div style={{ borderLeft: '1px solid white', height: 24 }}></div>
            <button className="btn btn-link text-white p-0" title="Redo">
              <i className="bi bi-arrow-clockwise fs-4 fw-bold" style={{fontSize:24, fontWeight:800}}></i>
            </button>

            <div className="custom-toggle-switch text-white d-flex align-items-center gap-2 mx-3 mt-1">
              <input type="checkbox" id="previewToggle" className="d-none" />
              <label htmlFor="previewToggle" className="toggle-slider"></label>
              <span className='mb-2 mx-2'>Preview</span>
            </div>

          </div> */}
        </div>



        <div className="d-flex flex-grow-1">
          <div ref={wrapperRef} className="flex-grow-1" onDrop={onDrop} onDragOver={onDragOver}>
            {/* <ReactFlow
            fitView
            minZoom={0.5}
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              nodesDraggable={type=="view"?false:true}
      nodesConnectable={type=="view"?false:true}
      elementsSelectable={type=="view"?false:true}
      panOnDrag={type=="view"?false:true} // Set to type=="view"?false:type=="view"?false:true to fully lock the viewport
      zoomOnScroll={type=="view"?false:true} // Keep true if you want users to zoom in/out
      preventScrolling={type=="view"?false:true} // Allows page scroll when hovering over flo
              // defaultViewport={{ x: 100, y: 50, zoom: 0.75 }}
            > */}
            <ReactFlow
  fitView
  fitViewOptions={{ maxZoom: 0.8 }}
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onConnect={onConnect}
  onInit={setReactFlowInstance}
  nodeTypes={nodeTypes}
  edgeTypes={edgeTypes}

  nodesDraggable={type == "view" ? false : true}
  nodesConnectable={type == "view" ? false : true}
  elementsSelectable={type == "view" ? false : true}
  panOnDrag={type == "view" ? false : true}

  zoomOnScroll={false}        // ❌ disable scroll zoom
  zoomOnPinch={false}         // ❌ disable touch zoom
  zoomOnDoubleClick={false}   // ❌ disable double click zoom

  // minZoom={0}                 // 🔒 lock zoom level
  // maxZoom={1}                 // 🔒 lock zoom level
// defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
  preventScrolling={true}
>
              <MiniMap />
              <Controls />
              <Background />
            </ReactFlow>
          </div>
{type!=="view"&&(<>
          <div
            className="card shadow"
            style={{ width: 220, position: 'absolute', right: '5px', bottom:'0', top: '107px', zIndex: 10 }}
          >
            <div
              className="card-header flex-column"
               style={{ backgroundColor: '#FFF1EB',padding:"12px 7px" }}// Orange header
            >
              {/* <div className='fw-bold py-2 px-3 text-center'>
              Workflow Elements
              </div> */}
              <div className="position-relative" style={{ width: "96%" }}>
  <input
    className="form-control"
    placeholder="Search module"
    value={searchKey}
    onChange={(e) => setSearchKey(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    }}
    style={{textIndent: "12px", paddingRight: "2.5rem",fontSize: "12px",height:"30px" }} // Space for icons
  />

  {/* Search Icon */}
  <i
    className="bi bi-search position-absolute"
    style={{
      // right: searchKey ? "2rem" : "0.8rem",
      left: "8px",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      fontSize: "12px",
    }}
    onClick={handleSearch}
  ></i>

  {/* Clear Icon (only when input has value) */}
  {searchKey && (
    <i
      className="bi bi-x-lg position-absolute"
      style={{
        right: "0.5rem",
        top: "50%",
        transform: "translateY(-50%)",
        cursor: "pointer",
        fontSize: "0.9rem",
      }}
      onClick={handleClear}
    ></i>
  )}
</div>

            </div>

            <div className="card-body p-2" style={{ maxHeight: '100vh', overflowY: 'scroll' }}  onScroll={handleScroll}>
              {moduleList.map((mod) => (
                <div
                  key={mod._id}
                  className="card mb-2 border"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('application/reactflow', JSON.stringify(mod))}
                  style={{ cursor: 'grab',height: 40}}
                >
                  <div className="card-body d-flex align-items-center" style={{padding:"0px"}}>
                    {/* Folder icon with light orange background */}
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        // backgroundColor: '#FFE5D1',
                        width: 20,
                        height: 20,
                        marginRight: 5,
                      }}
                    >
                      <i className="bi bi-folder-fill" style={{ color: '#EE5819' }}></i>
                    </div>

                    {/* Node name */}
                    <span className="fw-semibold" style={{ color: '#000',fontSize: "12px" }}>
                      {mod.name}
                    </span>
                  </div>
                </div>
              ))}
                {loading && <div className="text-center py-2">Loading...</div>}
  {/* {!hasMore && <div className="text-center py-2">End of List</div>} */}
  {!hasMore && <div className="text-center py-2"></div>}

            </div>
          </div>
</>)}

        </div>

        {/* <div className="bg-light text-center border-top py-2">
          <button className="btn btn-primary">Save Workflow</button>
        </div> */}
      </div>
    </ReactFlowProvider>
     <Modal
                backdrop="static"
                role="alertdialog"
                show={open}
                size='lg'
                onHide={handleClose}
                keyboard={false}
                dialogClassName="modal-top-right"
            >
                <Modal.Header className="align-items-center">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              className='selected_icon'
              onClick={() => setShowIconModal(true)}
              onMouseEnter={() => setShowEdit(true)}
              onMouseLeave={() => setShowEdit(false)}
            >
              <i className={`bi bi-${formData.icon || 'file-fill'} fs-4 text-dark`} />
              {showEdit && (
                <i className="bi bi-pencil-fill icon-edit-overlay" />
              )}
            </div>
            <Modal.Title>WorkFlow Setting</Modal.Title>
          </div>
                    <i
                        className="fa fa-times ms-auto"
                        role="button"
                        onClick={handleClose}
                        style={{ fontSize: '1.2rem', cursor: 'pointer' }}
                    />
                </Modal.Header>

      <Modal
        show={showIconModal}
        onHide={() => setShowIconModal(false)}
        size="md"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Icon</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <IconSelector
            selectedIcon={formData.icon}
            onSelect={(icon) => {
              handleIconSelect(icon);
              setShowIconModal(false);
            }}
          />
        </Modal.Body>
      </Modal>

                <Modal.Body>
                    <div className='container-fluid'>
                       <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Basic Information</h5>
              </div>
              <div className="card-body">
                <div className="row">
                <div className="form-group col-md-6 col-sm-12">
                <label>WorkFlow Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Enter flow name"
                  value={formData.name}
                  required
                  disabled={type == "edit"}
                  onChange={handleChange}
                />
              </div>
                <div className="form-group col-md-3 col-sm-12">
                <label>Parent Name</label>
                <input
                  type="text"
                  name="parentName"
                  className="form-control"
                  placeholder="Enter Parent Name"
                  value={formData.parentName}
                  required
                  disabled={type == "edit"}
                  onChange={handleChange}
                />
              </div>
                <div className="form-group col-md-3 col-sm-12">
                <label>Order Number</label>
                <input
                  type="text"
                  name="orderNumber"
                  className="form-control"
                  placeholder="Enter Order Number"
                  value={formData.orderNumber}
                  required
                  disabled={type == "edit"}
                  onChange={handleChange}
                />
              </div>
              </div>
            </div>
          </div>
          <div className="card shadow-sm border-0 mt-3">
              <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Table Settings</h5>
              </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="fw-bold">Select Form *</label>
                <CreatableSelect
                  name="prospectNo"
                  isClearable
                  placeholder="Type to search or create..."
                  value={formsData?.filter((option) => option.formId === selectedForm).map((item) => ({
                    label: item.formName,
                    value: item.formId,
                  }))}
                  onChange={(selectedOptions) => {
                    setSelectedForm(selectedOptions.value);
                  }}
                  options={formsData?.map((item) => ({
                    label: item.formName,
                    value: item.formId,
                  }))}
                />
              </div>
              <div style={{ width: '100%' }}>
      
                {currentForm && (
                  <>
                    <label className="fw-bold">Select Field to Display</label>
                    {/* SEARCH */}
                    <input
                      type="text"
                      placeholder="Search field..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      style={{
                        width: "100%",
                        padding: 6,
                        marginBottom: 10,
                        borderRadius: 6,
                        border: "1px solid #ccc"
                      }}
                    />

                    {/* FIELD LIST */}
                    <div
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: 10,
                        padding: 10,
                        height: 250,
                        overflowY: "auto",
                        marginBottom: 12
                      }}
                    >
                      {filteredFields.map(field => {
                        const checked = selectedFields[selectedForm]?.includes(field.value);

                        return (
                          <label
                            key={field.value}
                            style={{ display: "flex", gap: 8, marginBottom: 6 }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleField(selectedForm, field.value)}
                            />
                            {field.label}
                          </label>
                        );
                      })}

                      {filteredFields.length === 0 && (
                        <p style={{ color: "#777", fontSize: 12 }}>No fields found</p>
                      )}
                    </div>

                    {/* DEBUG (see what is selected) */}

                    {totalSelected > 0 && (
                      <>
                        <pre >
                          {totalSelected} fields selected
                        </pre>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
                        </div>
                         <div className="card shadow-sm border-0 mt-3">
              <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Define Workflow Stages</h5>
                <CustomButton label={'Add Stage'} onClick={handleAddStage} icon={'bi-plus'} appendClass='text-white'/>
              </div>
            <div className="card-body">
                  <div style={{ width: '100%', overflowY: 'auto' }}>
                    {stageOpen &&(<>
                    <div className="mb-2">
            <label className="form-label">Stage ID</label>
            <input
              disabled
              className="form-control"
              value={stageData.stageId}
              onChange={(e) => setStageData(d => ({ ...d, stageId: e.target.value }))}
              placeholder="e.g. 1"
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Stage Name</label>
            <input
              className="form-control"
              value={stageData.stageName}
              onChange={(e) => setStageData(d => ({ ...d, stageName: e.target.value }))}
              placeholder="e.g. Manager Approval"
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Add Forms in Stage</label>
            <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid #e9e9e9', padding: 8, borderRadius: 6 }}>
              {(availableStageForms || []).map(f => (
                <label key={f.formId} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <input
                    type="checkbox"
                    className="me-2"
                    checked={Array.isArray(stageData.formsId) && stageData.formsId.includes(f.formId)}
                    onChange={() => toggleStageForm(f.formId)}
                  />
                  <span>{f.formName}</span>
                </label>
              ))}
              {(!formsData || formsData.length === 0) && <div style={{ color: '#777', fontSize: 12 }}>No forms available</div>}
              {availableStageForms.length === 0 && formsData && formsData.length > 0 && (
                <div style={{ color: '#777', fontSize: 12 }}>All forms are already assigned to other stages</div>
              )}
            </div>
          </div>
           <div className="mb-2">
            <h6 className="form-label">Owner Details</h6>
          
            <div className='row'>
                <div className="mb-3 col-md-4 col-sm-12">
                <label className="fw-bold">Select Form *</label>
                <CreatableSelect
                  name="prospectNo"
                  isClearable
                  placeholder="Type to search or create..."
                  value={formsData?.filter((option) => option?.formId === stageData?.ownerUserFormId).map((item) => ({
                    label: item.formName,
                    value: item.formId,
                  }))}
                  onChange={(selectedOptions) => {
                    setStageData(s => ({ ...s, ownerUserFormId: selectedOptions.value}));
                  }}
                  options={formsData?.map((item) => ({
                    label: item.formName,
                    value: item.formId,
                  }))}
                />
              </div>
              <div className='col-md-4 col-sm-12'>
                <label className="fw-bold">Select User Type *</label>
              <select className="form-control mb-3" aria-label="User Type" onChange={(e) => {setStageData(s => ({ ...s, ownerUserSelectType: e.target.value })); getAssignUserList(stageData?.ownerUserFormId)}} value={stageData?.ownerUserSelectType}>
                <option value="">Select User Type</option>
                {stageData?.ownerUserFormId && (<>
                <option value="Creator">Creator</option>
                <option value="Approver">Approver</option>
                </>)}
              </select>
              </div>
                   <div className="mb-3 col-md-4 col-sm-12">
                <label className="fw-bold">Select User *</label>
                <CreatableSelect
                  name="prospectNo"
                  isClearable
                  placeholder="Type to search or create..."
                  value={(() => {
                    const ownerId = stageData?.ownerUserId;
                    // if (!ownerId) return null;
                    const list = stageData?.ownerUserSelectType === "Creator" ? (userData?.createUsers || []) : (userData?.approveUsers || []);
                    const found = list.find((u) => u._id == ownerId);
                    console.log('Finding user for ownerUserId:',stageData, ownerId, 'in list:', list, 'found:', found);
                    return found ? { label: found.name, value: found._id } : null;
                  })()}
                  onChange={(selectedOptions) => {
                    setStageData(s => ({ ...s, ownerUserId: selectedOptions ? selectedOptions.value : '' }));
                  }}
                  options={stageData?.ownerUserSelectType === "Creator" ? (userData?.createUsers || []).map((item) => ({
                    label: item.name,
                    value: item._id,
                  })) : (userData?.approveUsers || []).map((item) => ({
                    label: item.name,
                    value: item._id,
                  }))}
                />
              </div>
              </div>
           
            {/* <input
              className="form-control"
              value={stageData.stageName}
              onChange={(e) => setStageData(d => ({ ...d, ownerDetails: e.target.value }))}
              placeholder="e.g. Manager Approval"
            /> */}
          </div>
          <div className='d-flex gap-2'>
          <div className="mb-3">
            <CustomButton
              label="Cancel"
              appendClass='d-flex align-align-center'
              updateBgColor='#fff'
              onClick={() => {
                setStageData();
                setStageOpen(false);
                setStageEdit(false);
              }}
            />
              
          </div>
            <div className="mb-3">
            <CustomButton
              label="Add Stage"
              appendClass='d-flex align-align-center text-white'
              onClick={() => {
                if (!stageData.stageId || !stageData.stageName || stageData.formsId?.length === 0 || !stageData.ownerUserFormId || !stageData.ownerUserSelectType || !stageData.ownerUserId) {
                  toast.error('Please fill in all required fields');
                  return;
                }
                if (stageEdit) {
                  setStages(prev =>
                    prev.map(s =>
                      String(s.stageId) === String(stageData.stageId)
                        ? {
                            ...stageData,
                          }
                        : s
                    )
                  );
                } else {
                  setStages(prev => [
                    ...prev,
                    {
                      ...stageData,
                    },
                  ]);
                }
                setStageData();
                setStageOpen(false);
                setStageEdit(false);
              }}
            />
          </div>
          </div>
          </>)}
                    {stages.length === 0 ? (
                      <div className={`card shadow-sm h-100 card-body m-4 not-answerd-card`} style={{backgroundColor:'#fff'}}>
                      <p className="text-muted-not-answerd fst-italic mb-0" style={{color:'oklch(55.1% 0.027 264.364)'}}>
                        No stages defined yet. Click "Add Stage" to get started.
                           label="Add Stage"                 </p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm mb-0">
                          <thead>
                            <tr>
                              <th style={{width: '10%'}}>#</th>
                              <th style={{width: '30%'}}>Stage Number</th>
                              <th style={{width: '40%'}}>Stage Name</th>
                              <th style={{width: '20%'}}>Form</th>
                              <th style={{width: '10%'}}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stages.map((s, idx) => (
                              <tr key={idx}>
                                <td>{idx+1}</td>
                                <td>{s.stageId}</td>
                                <td>{s.stageName}</td>
                                <td>
                                  {Array.isArray(s.formsId)
                                    ? s.formsId
                                      .map(id => formsData?.find(f => f.formId === id)?.formName)
                                      .filter(Boolean)
                                      .join(', ')
                                    : formsData?.find(f => f.formId === s.formsId)?.formName || '—'}
                                </td>
                                {/* <td>{formsData?.find(f => f.formId === (Array.isArray(s.formsId) ? s.formsId[0] : s.formsId))?.formName || '—'}</td> */}
                                <td>
                                  <CommonActionIcons actions={
                                    [({
                                      type: "edit",
                                      label: "Edit",
                                      onClick: () => {
                                        setStageData(s?.ownerDetails?{stageId:s.stageId, stageName:s.stageName, formsId: s.formsId, ownerUserFormId: s.ownerDetails?.formId, ownerUserSelectType: s.ownerDetails?.selectType, ownerUserId: s.ownerDetails?.userId}:s);
                                        setStageOpen(true);
                                        setStageEdit(true);
                                        getAssignUserList(s.ownerDetails?.formId || s.ownerUserFormId)
                                      },
                                      className: "btn btn-warning btn-icon-split btn-sm mb-1",
                                      icon: "fa fa-edit",
                                    }),
                                  ({
                                      type: "delete",
                                      label: "Delete",
                                      onClick: () => setStages(prev => prev.filter((_, i) => i !== idx)),
                                      className: "btn btn-danger btn-icon-split btn-sm mb-1",
                                      icon: "fa fa-trash",
                                    })]
                                  }
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={() => handleClose('save')} appearance="primary">
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
             <ToastContainer/>
  </>);
}
