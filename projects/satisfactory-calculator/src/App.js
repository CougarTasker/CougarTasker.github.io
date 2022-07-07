import { useState } from 'react';
import './App.css';
import { useResource } from "./loadResources.ts";


function App() {
  const a = useResource();
  const b = useResource();
  const c = useResource();

  return (
    <div className='App'>
      <ul>
        <li>{a}</li>
        <li>{b}</li>
        <li>{c}</li>
      </ul>
    </div>
  );
}

export default App;
