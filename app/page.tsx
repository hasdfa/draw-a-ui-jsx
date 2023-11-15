"use client";

import dynamic from "next/dynamic";
import "@tldraw/tldraw/tldraw.css";
import { useEditor } from "@tldraw/tldraw";
import { getSvgAsImage } from "@/lib/getSvgAsImage";
import { blobToBase64 } from "@/lib/blobToBase64";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { PreviewModal } from "@/components/PreviewModal";

const Tldraw = dynamic(async () => (await import("@tldraw/tldraw")).Tldraw, {
  ssr: false,
});

function replaceImportsWithRequire(code: string) {
  // This regex matches various types of import statements
  const importRegex = /import(\s+\*\s+as\s+)?\s*(\{[^}]+\}|\w+)\s+from\s+['"](.+?)['"];?/g;

  // Replace each import statement with a require statement
  return code.replace(importRegex, (match, star, imports, modulePath) => {
    if (star) {
      // Handling namespace imports
      return `const ${imports.trim()} = require('${modulePath}');`;
    } else if (imports.trim().startsWith('{')) {
      // Handling multiple specific exports
      const items = imports.trim().slice(1, -1).split(',').map((item: string) => item.trim());
      return items.map((item: string) => {
        // This handles both named imports and aliased imports
        const parts = item.split(' as ');
        const originalName = parts[0].trim();
        const aliasName = parts[1] ? parts[1].trim() : originalName;
        return `const ${aliasName} = require('${modulePath}').${originalName};`;
      }).join('\n');
    } else {
      // Handling default imports
      return `const ${imports.trim()} = require('${modulePath}').default || require('${modulePath}');`;
    }
  });
}

export default function Home() {
  const [jsxCodeData, setJSXCode] = useState<null | string>(null);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setJSXCode(null);
      }
    };
    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  });

  return (
    <>
      <div className={`w-screen h-screen`}>
        <Tldraw persistenceKey="tldraw">
          <ExportButton setJSXCode={setJSXCode} />
        </Tldraw>
      </div>
      {jsxCodeData &&
        ReactDOM.createPortal(
          <div
            className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center"
            style={{ zIndex: 2000, backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={() => setJSXCode(null)}
          >
            <PreviewModal jsxCodeData={jsxCodeData} setJSXCode={setJSXCode} />
          </div>,
          document.body
        )}
    </>
  );
}

function ExportButton({ setJSXCode }: { setJSXCode: (jsxCode: string) => void }) {
  const editor = useEditor();
  const [loading, setLoading] = useState(false);
  // A tailwind styled button that is pinned to the bottom right of the screen
  return (
    <button
      onClick={async (e) => {
        setLoading(true);
        try {
          e.preventDefault();
          const svg = await editor.getSvg(
            Array.from(editor.currentPageShapeIds)
          );
          if (!svg) {
            return;
          }
          const png = await getSvgAsImage(svg, {
            type: "png",
            quality: 1,
            scale: 1,
          });
          const dataUrl = await blobToBase64(png!);
          const resp = await fetch("/api/toHtml", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ image: dataUrl }),
          });

          const json = await resp.json();

          // const json: any = {
          //   "id": "chatcmpl-8LJWsffHoZ2TnDt9p70n0kJe3Vi3q",
          //   "object": "chat.completion",
          //   "created": 1700090650,
          //   "model": "gpt-4-1106-vision-preview",
          //   "usage": {
          //     "prompt_tokens": 539,
          //     "completion_tokens": 1156,
          //     "total_tokens": 1695
          //   },
          //   "choices": [
          //     {
          //       "message": {
          //         "role": "assistant",
          //         "content": "```jsx\nimport React from 'react';\nimport {\n  AppBar,\n  Box,\n  CssBaseline,\n  Divider,\n  Drawer,\n  IconButton,\n  List,\n  ListItem,\n  ListItemText,\n  Toolbar,\n  Typography,\n  Button,\n  Avatar,\n  Paper,\n  ListItemIcon,\n  StarBorder,\n} from '@mui/material';\nimport MenuIcon from '@mui/icons-material/Menu';\nimport DashboardIcon from '@mui/icons-material/Dashboard';\nimport PeopleIcon from '@mui/icons-material/People';\nimport SettingsIcon from '@mui/icons-material/Settings';\nimport ExitToAppIcon from '@mui/icons-material/ExitToApp';\nimport { ReactECharts } from 'echarts-for-react';\n\nconst drawerWidth = 240;\n\nexport default function Dashboard() {\n  const [mobileOpen, setMobileOpen] = React.useState(false);\n\n  const handleDrawerToggle = () => {\n    setMobileOpen(!mobileOpen);\n  };\n\n  const drawerContent = (\n    <div>\n      <Toolbar>\n        <Typography variant=\"h6\" noWrap component=\"div\">\n          The coolest dashboard\n        </Typography>\n      </Toolbar>\n      <Divider />\n      <List>\n        <ListItem button>\n          <ListItemIcon>\n            <DashboardIcon />\n          </ListItemIcon>\n          <ListItemText primary=\"Dashboard\" />\n        </ListItem>\n        <ListItem button>\n          <ListItemIcon>\n            <PeopleIcon />\n          </ListItemIcon>\n          <ListItemText primary=\"Users\" />\n        </ListItem>\n        <ListItem button>\n          <ListItemIcon>\n            <SettingsIcon />\n          </ListItemIcon>\n          <ListItemText primary=\"Settings\" />\n        </ListItem>\n        <ListItem button>\n          <ListItemIcon>\n            <ExitToAppIcon />\n          </ListItemIcon>\n          <ListItemText primary=\"Sign out\" />\n        </ListItem>\n      </List>\n    </div>\n  );\n\n  const container = window !== undefined ? () => window.document.body : undefined;\n\n  const option = {\n    xAxis: {\n      type: 'category',\n      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],\n    },\n    yAxis: {\n      type: 'value',\n    },\n    series: [\n      {\n        data: [820, 932, 901, 934, 1290, 1330, 1320],\n        type: 'line',\n      },\n    ],\n  };\n\n  return (\n    <Box sx={{ display: 'flex' }}>\n      <CssBaseline />\n      <AppBar position=\"fixed\" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>\n        <Toolbar>\n          <IconButton\n            color=\"inherit\"\n            aria-label=\"open drawer\"\n            edge=\"start\"\n            onClick={handleDrawerToggle}\n            sx={{ mr: 2, display: { sm: 'none' } }}\n          >\n            <MenuIcon />\n          </IconButton>\n          <Typography variant=\"h6\" noWrap component=\"div\" sx={{ flexGrow: 1 }}>\n            Dashboard\n          </Typography>\n          <Button color=\"inherit\">Account</Button>\n        </Toolbar>\n      </AppBar>\n      <Box\n        component=\"nav\"\n        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}\n        aria-label=\"mailbox folders\"\n      >\n        <Drawer\n          container={container}\n          variant=\"temporary\"\n          open={mobileOpen}\n          onClose={handleDrawerToggle}\n          ModalProps={{\n            keepMounted: true, // Better open performance on mobile.\n          }}\n          sx={{\n            display: { xs: 'block', sm: 'none' },\n            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },\n          }}\n        >\n          {drawerContent}\n        </Drawer>\n        <Drawer\n          variant=\"permanent\"\n          sx={{\n            display: { xs: 'none', sm: 'block' },\n            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },\n          }}\n          open\n        >\n          {drawerContent}\n        </Drawer>\n      </Box>\n      <Box component=\"main\" sx={{ flexGrow: 1, p: 3 }}>\n        <Toolbar />\n        <ReactECharts option={option} style={{ height: '350px', marginBottom: '15px' }} />\n        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>\n          <Typography variant=\"h6\" gutterBottom>\n            Recent Users\n          </Typography>\n          <List>\n            <ListItem button>\n              <ListItemIcon>\n                <Avatar src=\"https://placehold.co/40\" />\n              </ListItemIcon>\n              <ListItemText primary=\"John Doe\" />\n              <StarBorder />\n            </ListItem>\n            <ListItem button>\n              <ListItemIcon>\n                <Avatar src=\"https://placehold.co/40\" />\n              </ListItemIcon>\n              <ListItemText primary=\"Alex Sor\" />\n              <StarBorder />\n            </ListItem>\n            <ListItem button>\n              <ListItemIcon>\n                <Avatar src=\"https://placehold.co/40\" />\n              </ListItemIcon>\n              <ListItemText primary=\"Pedro Alí\" />\n              <StarBorder />\n            </ListItem>\n          </List>\n        </Paper>\n      </Box>\n    </Box>\n  );\n}\n```\n\nThe code snippet above is a foundation for creating a dashboard in a single React component using Material-UI components and echarts-for-react for the chart visualization. Don't forget to install the required packages (`@mui/material`, `@mui/icons-material`, `echarts` and `echarts-for-react`) before running this code in your project."
          //       },
          //       "finish_details": {
          //         "type": "stop",
          //         "stop": "<|fim_suffix|>"
          //       },
          //       "index": 0
          //     }
          //   ]
          // }

          // const json: any = {
          //   "id": "chatcmpl-8LD30CVte2hsTAfhCw01nsky5Tzn3",
          //   "object": "chat.completion",
          //   "created": 1700065734,
          //   "model": "gpt-4-1106-vision-preview",
          //   "usage": {
          //     "prompt_tokens": 867,
          //     "completion_tokens": 823,
          //     "total_tokens": 1690
          //   },
          //   "choices": [
          //     {
          //       "message": {
          //         "role": "assistant",
          //         "content": "```jsx\nimport * as React from 'react';\nimport { Box, CssBaseline, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemText, Divider, ListItemAvatar, Avatar, ListItemIcon, Paper } from '@mui/material';\nimport BarChartIcon from '@mui/icons-material/BarChart';\nimport PeopleIcon from '@mui/icons-material/People';\nimport SettingsIcon from '@mui/icons-material/Settings';\nimport ExitToAppIcon from '@mui/icons-material/ExitToApp';\n\nconst drawerWidth = 240;\n\nfunction ResponsiveDrawer() {\n    const [selectedItem, setSelectedItem] = React.useState('Dashboard');\n\n    const handleListItemClick = (event, index) => {\n        setSelectedItem(index);\n    };\n\n    const drawer = (\n        <div>\n            <Toolbar>\n                <Typography variant=\"h6\" noWrap component=\"div\">\n                    Best react template\n                </Typography>\n            </Toolbar>\n            <Divider />\n            <List>\n                {['Dashboard', 'Users', 'Settings'].map((text, index) => (\n                    <ListItem\n                        button\n                        key={text}\n                        selected={selectedItem === text}\n                        onClick={(event) => handleListItemClick(event, text)}\n                    >\n                        <ListItemIcon>\n                            {index === 0 && <BarChartIcon />}\n                            {index === 1 && <PeopleIcon />}\n                            {index === 2 && <SettingsIcon />}\n                        </ListItemIcon>\n                        <ListItemText primary={text} />\n                    </ListItem>\n                ))}\n            </List>\n            <Divider />\n            <List>\n                <ListItem button key=\"Log out\">\n                    <ListItemIcon><ExitToAppIcon /></ListItemIcon>\n                    <ListItemText primary=\"Log out\" />\n                </ListItem>\n            </List>\n        </div>\n    );\n\n    const mainContent = (\n        <Box sx={{ flexGrow: 1, p: 3 }}>\n            <Toolbar />\n            {selectedItem === 'Dashboard' && (\n                <Paper sx={{ p: 2 }}>\n                    <Typography variant=\"h6\">Dashboard content goes here <BarChartIcon /></Typography>\n                </Paper>\n            )}\n            {selectedItem === 'Users' && (\n                <List>\n                    {['John Doe', 'Mike Jun', 'Andre Tan'].map((text, index) => (\n                        <ListItem key={text}>\n                            <ListItemAvatar>\n                                <Avatar src={`https://placehold.co/40x40?text=${text.charAt(0)}`} />\n                            </ListItemAvatar>\n                            <ListItemText primary={text} />\n                        </ListItem>\n                    ))}\n                </List>\n            )}\n            {selectedItem === 'Settings' && (\n                <Paper sx={{ p: 2 }}>\n                    <Typography variant=\"h6\">Settings content goes here <SettingsIcon /></Typography>\n                </Paper>\n            )}\n        </Box>\n    );\n\n    return (\n        <Box sx={{ display: 'flex' }}>\n            <CssBaseline />\n            <AppBar position=\"fixed\" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>\n                <Toolbar>\n                    <Typography variant=\"h6\" noWrap component=\"div\">\n                        Dashboard\n                    </Typography>\n                </Toolbar>\n            </AppBar>\n            <Drawer\n                variant=\"permanent\"\n                sx={{\n                    width: drawerWidth,\n                    flexShrink: 0,\n                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },\n                }}\n            >\n                {drawer}\n            </Drawer>\n            <Box\n                component=\"main\"\n                sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}\n            >\n                <Toolbar />\n                {mainContent}\n            </Box>\n        </Box>\n    );\n}\n\nexport default ResponsiveDrawer;\n```\nThis code provides a simple template based on the provided wireframe that uses Material-UI components to create a sidebar navigation with a main content area that changes based on the selected menu item. Replace the placeholder image URLs with actual image links as appropriate in your application."
          //       },
          //       "finish_details": {
          //         "type": "stop",
          //         "stop": "<|fim_suffix|>"
          //       },
          //       "index": 0
          //     }
          //   ]
          // }

          console.log('Got response', json)
          if (json.error) {
            alert("Error from open ai: " + JSON.stringify(json.error));
            return;
          }

          const message = json.choices[0].message.content;
          const start = message.indexOf("```jsx\n");
          const end = message.lastIndexOf("```");
          const jsxCode = message.slice(start + 7, end);

          console.log('jsxCode', JSON.stringify({ start, end, jsxCode }, null, 2))
          setJSXCode(jsxCode);
        } finally {
          setLoading(false);
        }
      }}
      className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ="
      style={{ zIndex: 1000 }}
      disabled={loading}
    >
      {loading ? (
        <div className="flex justify-center items-center ">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        </div>
      ) : (
        "Make Real"
      )}
    </button>
  );
}
