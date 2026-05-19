import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../css/homepostlogin.css'; // Assuming same styles
import FormInsertedTable from './FormBuilder/FormInsertedTable';

export default function OneApf({ permissions }) {
  // Find the "one apf" folder
  const folder = permissions?.find(mod => mod.name?.toLowerCase() === 'one apf');
  const tabs = folder?.modules?.map(child => ({ displayName: child.displayName, ...child })) || [];
  const [selectedTab, setSelectedTab] = useState('');
  const navigate = useNavigate();
  const { formName, formId } = useParams();

  // Extract formName and formId from URL
  const extractFormDetails = (url) => {
    // Extract formName and formId from URL like /forms-list/project/68bfbc6a4d00ad4bd5194e30
    const match = url?.match(/\/forms-list\/([^/]+)\/([^/?]+)/);
    if (match) {
      return { formName: match[1], formId: match[2] };
    }
    return null;
  };

  // Set first tab as active when component mounts or tabs change
  useEffect(() => {
    if (tabs.length > 0 && !selectedTab) {
      const firstTab = tabs[0];
      setSelectedTab(firstTab?.displayName);
      
      // Automatically navigate to first tab's form if not already on a form URL
      if (!formName || !formId) {
        const formDetails = extractFormDetails(firstTab.url);
        if (formDetails) {
          navigate(`/home/one-apf/${formDetails.formName}/${formDetails.formId}`);
        }
      }
    }
  }, [tabs, selectedTab, formName, formId, navigate]);

  // Update selectedTab when URL params change
  useEffect(() => {
    if (formName && formId) {
      // Find the tab that matches the current form
      const matchingTab = tabs.find(tab => {
        const formDetails = extractFormDetails(tab.url);
        return formDetails?.formName === formName && formDetails?.formId === formId;
      });
      if (matchingTab) {
        setSelectedTab(matchingTab.displayName);
      }
    }
  }, [formName, formId, tabs]);

  if (!folder || !folder.modules || folder.modules.length === 0) {
    return <div>No data available for One APF</div>;
  }

  return (
    <div className="container-fluid1">
      {/* <div className="main-title">
        <h1>One APF Modules</h1>
      </div> */}

      {/* Tabs with border bottom */}
      <div 
        className="tabs-container" 
        style={{ 
        //   borderBottom: '1px solid #ddd', 
          marginBottom: '20px',
          marginTop: '15px',
          display: 'flex',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitScrollbar: 'none'
        }}
      >
        <style>{`
          .tabs-container::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {tabs.map((tab) => (
          <button
            key={tab.displayName}
            className={`tab-button ${tab.displayName === selectedTab ? 'active' : ''}`}
            onClick={() => {
              setSelectedTab(tab.displayName);
              const formDetails = extractFormDetails(tab.url);
              if (formDetails) {
                navigate(`/home/one-apf/${formDetails.formName}/${formDetails.formId}`);
              }
            }}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: tab.displayName === selectedTab ? '#FF6900' : '#555',
              borderBottom: tab.displayName === selectedTab ? '2px solid #FF6900' : '2px solid transparent',
            //   fontWeight: tab.displayName === selectedTab ? 'bold' : 'normal',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {tab.displayName}
          </button>
        ))}
      </div>

      {/* Content for selected tab */}
      <div className="tab-content">
        {formName && formId ? (
          <>
            <FormInsertedTable key={`${formName}-${formId}`} />
          </>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
            Select a tab to view data
          </div>
        )}
      </div>
    </div>
  );
}