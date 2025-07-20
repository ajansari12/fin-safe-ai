import React from "react";

function App() {
  console.log('App rendering, React available:', !!React, typeof React);
  console.log('React.useState available:', !!React?.useState);
  console.log('React.useEffect available:', !!React?.useEffect);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Minimal App Test</h1>
      <p>React is working: {React ? 'Yes' : 'No'}</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}

export default App;