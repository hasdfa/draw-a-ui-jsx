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
    // get 'echarts'() { return require('echarts') },
    // get 'echarts-for-react'() {
    //   const { default: ReactECharts } = require('echarts-for-react')
    //   return { ReactECharts, default: ReactECharts }
    // },
    get '@mui/core'() { return require('@mui/core') },
    get '@mui/material'() { return require('@mui/material') },
    get '@mui/x-charts'() { return require('@mui/x-charts') },
    get '@mui/icons-material'() { return require('@mui/icons-material') },
    get '@mui/x-data-grid'() { return require('@mui/x-data-grid') },
    get 'react-charts'() { return require('react-charts') },
    get 'recharts'() { return require('recharts') },
    get 'react'() { return require('react') },
  }

  // @ts-ignore
  window.__require_known_module = (module: string) => {
    const Result = knownModules[module] ?? (() => {
      try {
        return require(module)
      } catch (err) {
        return null
      }
    })() ?? (() => {
      const root = module.split('/').slice(0, -1).join('/');
      const Elem = module.slice(root.length + 1);

      return knownModules[root]?.[Elem]
    })() ?? (() => {
      throw new Error(`Unknown module: ${module}`);
    })()

    console.log(`require("${module}") = `, Result)
    if (!Result) {
      alert(module)
    }

    return Result
  }
}

function RenderJSXCodeComponent(props: {
  srcDoc: string
}) {
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null)

  const Component = React.useMemo(() => {
    const jsxString = props.srcDoc;
    console.log('RAW', jsxString)

    const babel = require('@babel/standalone')
    const { code } = babel.transform(jsxString, {
      presets: ['env', 'react']
    });

    console.log('transformed', code)
    let polyfills = ''

    const compile = (): any => {
      try {
        return eval(`(function(){` +
            `var require=window.__require_known_module;` +
            `var exports={};` +
            polyfills + ';' +
            code +
            `;return exports;` +
            `})()`)
      } catch (error) {
        console.error(error)

        const msg = (error as any).message
        const match = /ReferenceError: (.+) is/.exec(msg)
        if (match) {
          polyfills += `var ${match[1]}=()=>'Not implemented';`
          console.log(`Added polyfill: ${match[1]}`, polyfills)
          return compile()
        }

        throw error
      }
    }

    return compile()
  }, [props.srcDoc])

  const [isLoaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    if (!isLoaded || !iframeRef.current) {
      console.error('iframeRef.current is null')
      return
    }

    const rootElement = iframeRef.current?.contentDocument?.getElementById('root')
    const emotionRoot = iframeRef.current?.contentDocument?.getElementById('emotion-cache')
    if (!rootElement || !emotionRoot) {
      console.error('rootElement || emotionRoot is null')
      return
    }

    if (!Component || !Component.default) {
      console.error('Component is null')
      return
    }

    const cache = createCache({
      key: 'css',
      prepend: true,
      container: emotionRoot,
    });

    // Render the children inside the shadow DOM
    ReactDOM.render(
        <CacheProvider value={cache}>
          <CssBaseline />
          {React.createElement(Component.default, {})}
        </CacheProvider>,
        rootElement
    );

    return () => {
      ReactDOM.unmountComponentAtNode(rootElement)
    }
  }, [isLoaded, Component])


  return (
      <iframe
          ref={iframeRef}
          className="w-full h-full"
          onLoad={() => setLoaded(true)}
          srcDoc={
              '<!DOCTYPE html>' +
              '<html lang="en">' +
              '    <head>' +
              '        <meta charset="utf-8" />' +
              '        <meta name="viewport" content="width=device-width, initial-scale=1" />' +
              '        <title>Demo</title>' +
              '        <style id="emotion-cache"></style>' +
              '    </head>' +
              '    <body>' +
              '        <noscript>You need to enable JavaScript to run this app.</noscript>' +
              '        <div id="root"></div>' +
              '    </body>' +
              '</html>'
          }
      />
  )
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
