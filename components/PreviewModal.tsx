"use client";

import React, { use, useEffect, useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-cshtml";

import "prismjs/themes/prism-tomorrow.css";
import ReactDOM from "react-dom";
import { CacheProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import createCache from "@emotion/cache";

export function PreviewModal({
  jsxCodeData,
  setJSXCode,
}: {
  jsxCodeData: string | null;
  setJSXCode: (html: string | null) => void;
}) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");

  useEffect(() => {
    const highlight = async () => {
      await Prism.highlightAll(); // <--- prepare Prism
    };
    highlight(); // <--- call the async function
  }, [jsxCodeData, activeTab]); // <--- run when post updates

  if (!jsxCodeData) {
    return null;
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
      className="bg-white rounded-lg shadow-xl flex flex-col"
      style={{
        width: "calc(100% - 64px)",
        height: "calc(100% - 64px)",
      }}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex space-x-1">
          <TabButton
            active={activeTab === "preview"}
            onClick={() => {
              setActiveTab("preview");
            }}
          >
            Preview
          </TabButton>
          <TabButton
            active={activeTab === "code"}
            onClick={() => {
              setActiveTab("code");
            }}
          >
            Code
          </TabButton>
        </div>

        <button
          className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring"
          onClick={() => {
            setJSXCode(null);
          }}
        >
          <svg
            className="w-6 h-6 text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      {activeTab === "preview" ? (
          <RenderJSXCodeComponent srcDoc={jsxCodeData} />
      ) : (
        <pre className="overflow-auto p-4">
          <code className="language-markup">{jsxCodeData}</code>
        </pre>
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  const knownModules: Record<string, any> = {
    '@mui/material': require('@mui/material'),
    '@mui/icons-material': require('@mui/icons-material'),
    'react': require('react'),
  }

  // @ts-ignore
  window.__require_known_module = (module: string) => {
    return knownModules[module] ?? (() => {
      try {
        return require(module)
      } catch (err) {
        return null
      }
    })() ?? (() => {
      const root = module.split('/').slice(0, -1).join('/');
      const Elem = module.slice(root.length + 1);
      const pkg = knownModules[root]

      console.log('PKG', root, Elem, pkg[Elem])
      return pkg?.[Elem]
    })() ?? (() => {
      throw new Error(`Unknown module: ${module}`);
    })()
  }
}

const ShadowDOMComponent = (props: { children: React.ReactElement }) => {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const shadowRootRef = React.useRef<ShadowRoot | null>(null);

  useEffect(() => {
    if (!hostRef.current) {
      return;
    }

    if (!shadowRootRef.current) {
      // Create a shadow root
      shadowRootRef.current = hostRef.current.attachShadow({ mode: 'closed' });
    }

    const emotionRoot = document.createElement('style');
    const shadowRootElement = document.createElement('div');

    shadowRootRef.current.appendChild(emotionRoot);
    shadowRootRef.current.appendChild(shadowRootElement);

    const cache = createCache({
      key: 'css',
      prepend: true,
      container: emotionRoot,
    });

    // Render the children inside the shadow DOM
    ReactDOM.render(
        <CacheProvider value={cache}>
          <CssBaseline />
          {props.children}
        </CacheProvider>,
        shadowRootElement
    );

    return () => {
      if (!shadowRootRef.current) {
        return
      }

      // Cleanup: unmount React component from the shadow DOM
      ReactDOM.unmountComponentAtNode(shadowRootRef.current);
      shadowRootRef.current.innerHTML = '';
    };
  }, [props.children]);

  return <div ref={hostRef} className="w-full h-full"/>
};

function RenderJSXCodeComponent(props: {
  srcDoc: string
}) {
  const Component = React.useMemo(() => {
    const jsxString = props.srcDoc;
    console.log('RAW', jsxString, '\n\n')

    const babel = require('@babel/standalone')

    const { code } = babel.transform(jsxString, {
      presets: ['env', 'react']
    });

    console.log('COMPILED', code, '\n\n')
    return eval(`(function(){` +
        `var require=window.__require_known_module;` +
        `var exports={};` +
        code +
        `;console.log(React);` +
        `;return exports` +
    `})()`)
  }, [props.srcDoc])

  if (!Component || !Component.default) {
    return null
  }

  const Element = Component.default()
  if (!Element) {
    return null
  }

  return Element
}

interface TabButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  active: boolean;
}

function TabButton({ active, ...buttonProps }: TabButtonProps) {
  const className = active
    ? "px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-t-md focus:outline-none focus:ring"
    : "px-4 py-2 text-sm font-medium text-blue-500 bg-transparent hover:bg-blue-100 focus:bg-blue-100 rounded-t-md focus:outline-none focus:ring";
  return <button className={className} {...buttonProps}></button>;
}
