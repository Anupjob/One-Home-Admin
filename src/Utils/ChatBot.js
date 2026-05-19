import React, { useState, useEffect, useRef } from "react";
import { FaRobot } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { v4 as uuidv4 } from "uuid"; // session id generator
import postApiCall from "../Services/postApiCall";
import ReactMarkdown from "react-markdown";

const ChatBot = () => {
  const chatBodyRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // disable send button

  // Generate session id when chat opens
  useEffect(() => {
    if (isOpen) {
      const newId = uuidv4();
      setSessionId(newId);
      setMessages([
        { sender: "bot", text: "Hi, I’m Herry 👋 How can I help you today?" }
      ]);
    }
  }, [isOpen]);

  const handleToggle = () => setIsOpen(!isOpen);

//   const handleSend = () => {
//     if (!input.trim()) return;

//     const newMessage = { sender: "user", text: input };
//     setMessages((prev) => [...prev, newMessage]);
//     setInput("");
//     setIsProcessing(true);
//     setIsTyping(true);

//     // Simulate API delay
//     setTimeout(() => {
//       setIsTyping(false);

//       // 🔗 Replace with API call
//       const fullResponse = "This is a sample response for session " + sessionId;

//       // Simulate typing motion (char by char)
//       let i = 0;
//       const interval = setInterval(() => {
//         setMessages((prev) => {
//           const lastMsg = prev[prev.length - 1];
//           if (lastMsg && lastMsg.sender === "bot-typing") {
//             // update existing
//             return [
//               ...prev.slice(0, prev.length - 1),
//               { sender: "bot-typing", text: fullResponse.slice(0, i) }
//             ];
//           } else {
//             // create new
//             return [
//               ...prev,
//               { sender: "bot-typing", text: fullResponse.slice(0, i) }
//             ];
//           }
//         });
//         i++;
//         if (i > fullResponse.length) {
//           clearInterval(interval);
//           setMessages((prev) => {
//             const cleaned = prev.filter((m) => m.sender !== "bot-typing");
//             return [...cleaned, { sender: "bot", text: fullResponse }];
//           });
//           setIsProcessing(false); // ✅ re-enable send
//         }
//       }, 50);
//     }, 1500);
//   };

const handleSend = async () => {
  if (!input.trim()) return;

  const newMessage = { sender: "user", text: input };
  setMessages((prev) => [...prev, newMessage]);
  setInput("");
  setIsProcessing(true);
  setIsTyping(true);
  let payload={
  message: input,
  sessionId:sessionId
  }

  try {
    // 🔗 Call your API
     const data = await postApiCall("admin/chatbot/send-message", payload);
        //   if (data.meta.status) {
    const fullResponse = data.data?.reply || "It seems like the function \"retrieve\" provided some useful information about E-Auctions. However, I don't have any further information to provide. If you have any specific questions related to E-Auctions, I can try to help you find the answer.";

    // Simulate typing motion (char by char)
    let i = 0;
    const interval = setInterval(() => {
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.sender === "bot-typing") {
          // update existing
          return [
            ...prev.slice(0, prev.length - 1),
            { sender: "bot-typing", text: fullResponse.slice(0, i) }
          ];
        } else {
          // create new
          return [
            ...prev,
            { sender: "bot-typing", text: fullResponse.slice(0, i) }
          ];
        }
      });

      i++;
      if (i > fullResponse.length) {
        clearInterval(interval);
        setMessages((prev) => {
          const cleaned = prev.filter((m) => m.sender !== "bot-typing");
          return [...cleaned, { sender: "bot", text: fullResponse }];
        });
        setIsProcessing(false); // ✅ re-enable send
      }
    }, 50);
     setIsTyping(false);
// }
  } catch (error) {
    console.error("API Error:", error);
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "Sorry, something went wrong. Please try again." }
    ]);
    setIsProcessing(false);
    setIsTyping(false);
  }
};

useEffect(() => {
  if (chatBodyRef.current) {
    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }
}, [messages, isTyping]);

  return (
    <>
      {/* Floating Bot Button (Always visible) */}
      <button
        className="btn btn-warning rounded-circle p-3 position-fixed"
        style={{ bottom: "20px", right: "20px", zIndex: 1050 }}
        onClick={handleToggle}
      >
        <FaRobot size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="card shadow position-fixed"
          style={{
            bottom: "59px",
            right: "8px",
            width: "50%",
            height: "420px",
            borderRadius: "12px",
            overflow: "hidden",
            zIndex: 1050
          }}
        >
          {/* Header */}
          <div className="card-header bg-primary text-white fw-bold text-center">
            🤖 Herry
          </div>

          {/* Body */}
          <div
            className="card-body d-flex flex-column bg-light"
            style={{ overflowY: "auto" }}
             ref={chatBodyRef}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 my-1 rounded ${
                  msg.sender === "user"
                    ? "bg-success text-white align-self-end"
                    : "bg-white text-dark align-self-start"
                }`}
                style={{ maxWidth: "80%" }}
              >
                {/* {msg.text} */}
                 <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            ))}

            {isTyping && (
              <div className="bg-white text-dark p-2 my-1 rounded align-self-start">
                <div
                  className="spinner-border spinner-border-sm text-secondary me-2"
                  role="status"
                ></div>
                Thinking...
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="card-footer d-flex p-2">
           <textarea
  className="form-control me-2"
  placeholder="Type a message..."
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey && !isProcessing) {
      e.preventDefault(); // prevent new line
      handleSend();
    }
  }}
  disabled={isProcessing}
  rows={1}
  style={{
    maxHeight: "6.5em", // ~3 lines
    resize: "none",
    overflowY: "auto"
  }}
/>

            <button
              className="btn btn-warning"
              onClick={handleSend}
              disabled={isProcessing}
            >
              <IoSend />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
