import React from 'react';
import SpeechBubble from './SpeechBubble';

function App() {
  
  return (
    <>
      //example parameters to pass to a SpeechBubble object
      <SpeechBubble buttonsText={["syntaxError", "typeError"]} text={"What kind of error do you have?"} />
    </>
  ) 
}

export default App;
