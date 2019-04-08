import React, { Component } from 'react';
import './App.css';
import FabricCanvas from './FabricCanvas.js';

import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import {fabric} from 'fabric';


class App extends Component {



  render() {
    return (
      <div className="App">
        <SimpleMDE onChange={this.handleChange} getMdeInstance= { FabricCanvas.getInsance } />
        <FabricCanvas/>
      </div>
    );
  }
}

export default App;
