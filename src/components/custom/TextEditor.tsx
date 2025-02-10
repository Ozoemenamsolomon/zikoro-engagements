"use client"

import React, { useState } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css"
const QuillEditor = dynamic(() => import("react-quill"), { ssr: false });


export function TextEditor({
  onChange,
  defaultValue,
  placeholder,
  onFocus,
  onBlur,
  error

}: {
  onChange: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
  onFocus?:() => void;
  onBlur?:() => void;
  error?:string;
}) {
  const CustomUndo = () => (
    <svg viewBox="0 0 18 18">
      <polygon className="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10" />
      <path
        className="ql-stroke"
        d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"
      />
    </svg>
  );

  // Redo button icon component for Quill editor
  const CustomRedo = () => (
    <svg viewBox="0 0 18 18">
      <polygon className="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10" />
      <path
        className="ql-stroke"
        d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"
      />
    </svg>
  );

  const quillModules = {
    toolbar: {
      container: [
        ["bold", "italic", "underline", "strike"],
        ["blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ script: "sub" }, { script: "super" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ color: [] }, { background: [] }],
        [
          {
            font: [],
          },
        ],
        ["link"], //  "video"
        ["clean"],
        ["undo", "redo"],
      ],
    },
    history: {
      delay: 500,
      maxStack: 100,
      userOnly: true,
    },
  };


  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "link",
    "image",
    "color",
    "code-block",
    "undo",
    "redo",
    "imageResize",
    "clean",
    "code-block",
    "imageTextAlternative",
    "font",
    "size",
    "background",
    "indent",
    "list",
    "script"
  ];

  const [content, setContent] = useState(defaultValue);
  const handleEditorChange = (content: string) => {
    setContent(content);
    onChange(content);
    
  };

  return (
    <div className="w-full interaction-input">
        <QuillEditor
        onBlur={onBlur}
        onFocus={onFocus}
      value={content}
      onChange={(e) => {
        handleEditorChange(e);
      }}
      modules={ quillModules }
      formats={quillFormats}
      theme="snow"

      placeholder={placeholder || "Enter description"}
      className="w-full  ql-container focus:ring-1"
    />
     {error && <p className="text-xs textred-500 mt-2">{error}</p>}
    </div>

  );
}
