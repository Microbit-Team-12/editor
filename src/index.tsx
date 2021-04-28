import React from 'react';
import ReactDOM from 'react-dom';
import APIDemo from './components/APIDemo';
import './index.css';
import { defaultTutorialList } from './resources/tutorial_list';
import { publicTutorialResolver } from './tutorial';

ReactDOM.render(
  <React.StrictMode>
    <APIDemo tutorialList={defaultTutorialList} tutorialResolver={publicTutorialResolver}/>
  </React.StrictMode>,
  document.getElementById('root')
);
