import React, { Component } from 'react';

class SpeechBubble extends Component {
  //render should be pure - doesn't modify component state
  render() {
    //examine this.props
    //examine this.state
    const buttons = this.state.buttonsText
    const fullText = this.state.text

    //returns html with the correct space for text and, 
    //                  the correct number of buttons of the correct size 
    return (
      <>
        <div>{fullText}</div>
        <ul>
        {
          buttons.map(function(button){
            return <button>{button}</button>
          })
        }
        </ul>
      </>
    )
  }

  constructor(props) {
    super(props);
    this.state = { buttonsText: props.buttonsText, 
                   text: props.text };
  }

}

export default SpeechBubble