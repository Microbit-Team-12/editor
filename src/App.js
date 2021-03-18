import React from 'react';
import SpeechBubble from './SpeechBubble';

function App() {
  
  return (
    <>
      <SpeechBubble buttonsText={["syntaxError", "typeError"]} text={"What kind of error do you have?"} />
    </>
  ) 
}

export default App;
