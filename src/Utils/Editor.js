import React, { useRef, useState, useEffect } from "react";
import './Editor.css'

const LinkModal = ({ show, onClose, onInsert, defaultText = "" }) => {
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState(defaultText);

  const handleInsert = () => {
    if (linkUrl && linkText) {
      onInsert(linkUrl, linkText);
      setLinkUrl("");
      setLinkText("");
    }
    onClose();
  };

  return (
    show && (
      <div className="modal d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Insert Link</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Link Text</label>
                <input
                  type="text"
                  className="form-control"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">URL</label>
                <input
                  type="url"
                  className="form-control"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleInsert}>
                Insert
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

const Editor = ({ initialContent = "", onChange }) => {
  const editorRef = useRef(null);
  const savedSelection = useRef(null); // store selection range
  const [activeCommands, setActiveCommands] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedText, setSelectedText] = useState("");

  // Save selection before opening modal
  const openModal = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      savedSelection.current = selection.getRangeAt(0); // save current cursor range
    }
    const text = selection && selection.toString();
    setSelectedText(text || "");
    setShowModal(true);
  };
  // Restore selection before inserting link
  const restoreSelection = () => {
    const selection = window.getSelection();
    if (savedSelection.current) {
      selection.removeAllRanges();
      selection.addRange(savedSelection.current);
    }
  };

  // Insert link
  const handleInsertLink = (url, text) => {
    restoreSelection();
    if (text) {
      const html = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      exec("insertHTML", html);
    } else {
      exec("insertHTML", `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
    }
  };

  // Run formatting commands
  const exec = (command, value = "") => {
    document.execCommand(command, false, value);
    updateActiveStates();
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Update which buttons are active
  const updateActiveStates = () => {
    const commands = ["bold", "italic", "underline", "strikeThrough", "insertOrderedList", "insertUnorderedList"];
    const newStates = {};
    commands.forEach(cmd => {
      newStates[cmd] = document.queryCommandState(cmd);
    });
    setActiveCommands(newStates);
  };

  useEffect(() => {
    const editor = editorRef.current;
    const handleClick = (e) => {
      const link = e.target.closest("a"); // detect if clicked element is a link
      if (link) {
        e.preventDefault(); // stop default navigation

        const href = link.getAttribute("href");
        console.log("Clicked link:", href);

        // open in new tab
        window.open(href, "_blank", "noopener,noreferrer");

        // you can also call API or analytics here
        // api.trackClick(href)
      }
    };

    editor.addEventListener("click", handleClick);
    return () => editor.removeEventListener("click", handleClick);
  }, []);
  const handlePaste = (e) => {
    e.preventDefault();

    // Get both plain text and HTML
    const html = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");

    if (html) {
      // Insert as real HTML (keeps formatting, links, etc.)
      document.execCommand("insertHTML", false, html);
    } else {
      // Fallback for plain text
      document.execCommand("insertText", false, text);
    }
  };



  // Keep updating states while user types or clicks
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.addEventListener("keyup", updateActiveStates);
    editor.addEventListener("mouseup", updateActiveStates);

    return () => {
      editor.removeEventListener("keyup", updateActiveStates);
      editor.removeEventListener("mouseup", updateActiveStates);
    };
  }, []);

const isInitialized = useRef(false);

useEffect(() => {
  if (!isInitialized.current && editorRef.current) {
    if (!initialContent || initialContent.trim() === "") {
      editorRef.current.innerHTML = "<p><br/></p>"; // default empty paragraph
    } else {
      editorRef.current.innerHTML = initialContent; // set initial content
       isInitialized.current = true;
    }
    // mark as initialized
  }
}, [initialContent]);

  return (
    <div className="editor-wrapper shadow-sm rounded bg-white">
      {/* Toolbar */}
      <div className="toolbar d-flex flex-wrap align-items-center p-2 bg-light rounded-top">
        <select
          className="form-select form-select-sm form-control w-auto ms-2"
          onChange={(e) => exec("formatBlock", e.target.value)}
        >
          <option value="<p>">Paragraph</option>
          <option value="<h1>">H1</option>
          <option value="<h2>">H2</option>
          <option value="<h3>">H3</option>
          <option value="<h4>">H4</option>
          <option value="<h5>">H5</option>
          <option value="<h6>">H6</option>
        </select>

        <button
          type="button"
          className={`btn btn-sm btn-outline-secondary ${activeCommands.bold ? "active-btn" : ""}`}
          onClick={() => exec("bold")}
          title="Bold"
        >
          <b>B</b>
        </button>
        <button
          type="button"
          className={`btn btn-sm btn-outline-secondary ${activeCommands.italic ? "active-btn" : ""}`}
          onClick={() => exec("italic")}
          title="Italic"
        >
          <i>I</i>
        </button>
        <button
          type="button"
          className={`btn btn-sm btn-outline-secondary ${activeCommands.underline ? "active-btn" : ""}`}
          onClick={() => exec("underline")}
          title="Underline"
        >
          <u>U</u>
        </button>
        <button
          type="button"
          className={`btn btn-sm btn-outline-secondary ${activeCommands.strikeThrough ? "active-btn" : ""}`}
          onClick={() => exec("strikeThrough")}
          title="Strikethrough"
        >
          <s>S</s>
        </button>

        <button
          type="button"
          className={`btn btn-sm btn-outline-secondary ${activeCommands.insertUnorderedList ? "active-btn" : ""}`}
          onClick={() => exec("insertUnorderedList")}
          title="Bullet List"
        >
          List
        </button>
        <button
          type="button"
          className={`btn btn-sm btn-outline-secondary ${activeCommands.insertOrderedList ? "active-btn" : ""}`}
          onClick={() => exec("insertOrderedList")}
          title="Numbered List"
        >
          Number
        </button>

        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={openModal}
          title="Insert Link"
        >
          🔗
        </button>

        <select
          className="form-select form-select-sm form-control w-auto ms-2"
          onChange={(e) => exec("foreColor", e.target.value)}
        >
          <option value="">Text Color</option>
          <option value="red">Red</option>
          <option value="blue">Blue</option>
          <option value="green">Green</option>
          <option value="black">Black</option>
        </select>
      </div>

      {/* Editable Content Area */}
      <div
        ref={editorRef}
        className="editor-area p-3 rounded-bottom"
        contentEditable
        suppressContentEditableWarning={true}
        onInput={() => onChange && onChange(editorRef?.current?.innerHTML)}
        onPaste={handlePaste}
        // dangerouslySetInnerHTML={{ __html: initialContent }}
        data-placeholder="Start writing..."
      />
      <LinkModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onInsert={handleInsertLink}
        defaultText={selectedText}
      />
    </div>
  );
};

export default Editor;
