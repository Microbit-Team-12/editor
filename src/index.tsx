import React from 'react';
import ReactDOM from 'react-dom';
import MainApp from './components/MainApp';
import './index.css';
import { defaultTutorialList } from './resources/tutorial_list';
import { publicTutorialResolver } from './tutorial';

ReactDOM.render(
  <React.StrictMode>
    <MainApp tutorialList={defaultTutorialList} tutorialResolver={publicTutorialResolver}/>
  </React.StrictMode>,
  document.getElementById('root')
);
