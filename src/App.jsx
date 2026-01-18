import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, Loader2, X, Plus } from 'lucide-react';

export default function AIResumeReviewer() {
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        alert('Please upload a PDF file only');
      }
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const userMessage = {
      type: 'user',
      content: input,
      hasFile: !!file,
      fileName: file?.name
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const formData = new FormData();

      if (file) {
        formData.append('resume', file);
      }

      formData.append('question', userMessage.content);

      const response = await fetch('https://ai-resume-reviewer-backend-npd0.onrender.com/analyze', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.error || data.status === 'error') {
        setMessages(prev => [...prev, {
          type: 'error',
          content: data.error || 'Something went wrong'
        }]);
      } else if (data.status === 'success' && data.data) {
        setMessages(prev => [...prev, {
          type: 'ai',
          content: data.data
        }]);
      }

      setFile(null);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        type: 'error',
        content: 'Failed to connect to backend. Make sure the server is running.'
      }]);
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setFile(null);
    setInput('');
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        #root {
          max-width: none !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .chat-container::-webkit-scrollbar {
          width: 6px;
        }
        
        .chat-container::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .chat-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        
        .chat-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        textarea {
          resize: none;
          overflow: hidden;
        }

        /* Mobile Safe Area */
        @supports (padding: max(0px)) {
          .safe-top {
            padding-top: max(12px, env(safe-area-inset-top));
          }
          .safe-bottom {
            padding-bottom: max(20px, env(safe-area-inset-bottom));
          }
        }
      `}</style>
      
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#212121',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Header */}
        <div className="safe-top" style={{
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h1 style={{
            fontSize: 'clamp(16px, 4vw, 18px)',
            fontWeight: '600',
            color: '#ffffff',
            letterSpacing: '-0.5px'
          }}>
            Resumerrr
          </h1>

          {messages.length > 0 && (
            <button
              onClick={handleNewChat}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: 'clamp(12px, 3vw, 14px)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <Plus size={16} />
              <span style={{ display: window.innerWidth < 400 ? 'none' : 'inline' }}>New Chat</span>
            </button>
          )}
        </div>

        {/* Chat Messages */}
        <div 
          className="chat-container"
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            padding: 'clamp(12px, 3vw, 20px)'
          }}
        >
          <div style={{
            maxWidth: '900px',
            width: '100%',
            margin: '0 auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(16px, 4vw, 24px)'
          }}>
            {/* Welcome Message */}
            {messages.length === 0 && !loading && (
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 16px'
              }}>
                <div style={{
                  textAlign: 'center',
                  color: '#ffffff',
                  opacity: 0.6
                }}>
                  <div style={{
                    fontSize: 'clamp(16px, 4vw, 18px)',
                    fontWeight: '500'
                  }}>How can I help you today?</div>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                width: '100%'
              }}>
                <div style={{
                  maxWidth: window.innerWidth < 768 ? '85%' : '75%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {msg.type === 'user' && (
                    <div>
                      {msg.hasFile && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          marginBottom: '8px',
                          fontSize: 'clamp(11px, 2.5vw, 12px)',
                          color: '#b0b0b0',
                          float: 'right',
                          clear: 'both'
                        }}>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            backgroundColor: '#ef4444',
                            borderRadius: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '8px',
                            fontWeight: '700',
                            color: 'white'
                          }}>
                            PDF
                          </div>
                          <span style={{
                            maxWidth: window.innerWidth < 768 ? '100px' : '150px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {msg.fileName}
                          </span>
                        </div>
                      )}
                      <div style={{
                        backgroundColor: '#2f2f2f',
                        color: '#ffffff',
                        padding: 'clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px)',
                        borderRadius: '18px',
                        fontSize: 'clamp(14px, 3.5vw, 15px)',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        clear: 'both'
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  )}

                  {msg.type === 'error' && (
                    <div style={{
                      backgroundColor: '#3d1f1f',
                      color: '#fca5a5',
                      padding: 'clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px)',
                      borderRadius: '18px',
                      fontSize: 'clamp(13px, 3vw, 14px)',
                      lineHeight: '1.5',
                      border: '1px solid rgba(239, 68, 68, 0.3)'
                    }}>
                      ⚠️ {msg.content}
                    </div>
                  )}

                  {msg.type === 'ai' && (
                    <div>
                      <div style={{
                        backgroundColor: '#2a2a2a',
                        color: '#e8e8e8',
                        padding: 'clamp(12px, 3vw, 14px) clamp(12px, 3vw, 16px)',
                        borderRadius: '18px',
                        fontSize: 'clamp(14px, 3.5vw, 15px)',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        marginBottom: msg.content.recommended_projects?.length > 0 || msg.content.skills_to_focus?.length > 0 ? '12px' : 0
                      }}>
                        {msg.content.answer}
                      </div>

                      {msg.content.recommended_projects?.length > 0 && (
                        <div style={{
                          backgroundColor: 'rgba(251, 191, 36, 0.1)',
                          border: '1px solid rgba(251, 191, 36, 0.3)',
                          borderRadius: '12px',
                          padding: 'clamp(10px, 2.5vw, 12px)',
                          marginBottom: '12px'
                        }}>
                          <div style={{
                            fontSize: 'clamp(12px, 3vw, 13px)',
                            fontWeight: '600',
                            color: '#fbbf24',
                            marginBottom: '8px'
                          }}>
                            💡 Recommended Projects
                          </div>
                          <ul style={{
                            margin: 0,
                            paddingLeft: '20px',
                            color: '#d1d5db',
                            fontSize: 'clamp(13px, 3.2vw, 14px)',
                            lineHeight: '1.6'
                          }}>
                            {msg.content.recommended_projects.map((project, i) => (
                              <li key={i} style={{ marginBottom: '4px' }}>{project}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {msg.content.skills_to_focus?.length > 0 && (
                        <div style={{
                          backgroundColor: 'rgba(96, 165, 250, 0.1)',
                          border: '1px solid rgba(96, 165, 250, 0.3)',
                          borderRadius: '12px',
                          padding: 'clamp(10px, 2.5vw, 12px)'
                        }}>
                          <div style={{
                            fontSize: 'clamp(12px, 3vw, 13px)',
                            fontWeight: '600',
                            color: '#60a5fa',
                            marginBottom: '8px'
                          }}>
                            🎯 Skills to Focus On
                          </div>
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '6px'
                          }}>
                            {msg.content.skills_to_focus.map((skill, i) => (
                              <span key={i} style={{
                                backgroundColor: 'rgba(96, 165, 250, 0.15)',
                                color: '#93c5fd',
                                padding: '4px 10px',
                                borderRadius: '10px',
                                fontSize: 'clamp(11px, 2.8vw, 12px)',
                                fontWeight: '500'
                              }}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start'
              }}>
                <div style={{
                  backgroundColor: '#2a2a2a',
                  padding: '12px 16px',
                  borderRadius: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Loader2 size={16} color="#888" style={{
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span style={{
                    color: '#888',
                    fontSize: 'clamp(13px, 3vw, 14px)'
                  }}>Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="safe-bottom" style={{
          padding: '12px 16px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            {/* File Attachment Preview */}
            {file && (
              <div style={{
                marginBottom: '12px'
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: 'clamp(12px, 3vw, 13px)',
                  color: '#e0e0e0'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#ef4444',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    fontWeight: '700',
                    color: 'white'
                  }}>
                    PDF
                  </div>
                  <span style={{
                    maxWidth: window.innerWidth < 768 ? '150px' : '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {file.name}
                  </span>
                  <button
                    onClick={() => setFile(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      color: '#888'
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Input Box */}
            <div style={{
              backgroundColor: '#2f2f2f',
              borderRadius: '24px',
              padding: 'clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px)',
              display: 'flex',
              alignItems: 'flex-end',
              gap: 'clamp(8px, 2vw, 12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {/* Attach Button */}
              <label style={{
                cursor: 'pointer',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                padding: '6px',
                touchAction: 'manipulation'
              }}>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <Paperclip 
                  size={20} 
                  color={file ? '#667eea' : '#888'}
                  style={{ transition: 'color 0.2s' }}
                />
              </label>

              {/* Text Input */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message"
                disabled={loading}
                style={{
                  flex: 1,
                  background: 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  outline: 'none',
                  fontSize: 'clamp(14px, 3.5vw, 15px)',
                  fontFamily: 'inherit',
                  lineHeight: '1.5',
                  minHeight: '24px',
                  maxHeight: '150px'
                }}
                rows={1}
              />

              {/* Send Button */}
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || loading}
                style={{
                  flexShrink: 0,
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: (input.trim() && !loading) ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: (input.trim() && !loading) ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  touchAction: 'manipulation'
                }}
              >
                <Send 
                  size={16} 
                  color={(input.trim() && !loading) ? '#212121' : '#666'}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}