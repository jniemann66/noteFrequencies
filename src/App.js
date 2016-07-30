import React, { Component } from 'react';
import './App.css';

class App extends Component {
   constructor(props) {
    super(props);
    this.state = {
      baseFreq: 440
    };
  }
  
  handleValuesChange(evt){
    this.setState({
      baseFreq: evt.target.value
    });
  }
   
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Note Frequencies</h2> 
        </div>
        <br />
        Fine Tuning: <input type="Range" min="430" max="450" value={this.state.baseFreq} onChange={this.handleValuesChange.bind(this)} />
        <p>{"A4 = " + this.state.baseFreq + " Hz"}</p>
        <NoteFrequencyTable baseFreq={this.state.baseFreq} />
        <p className="App-copyright">© 2016 - Judd Niemann</p>
      </div>
    );
  }
}

class Synth {
  constructor() {
    if(!isBrowserIE()) { // no version of IE supports WEB Audio API ; other modern browers OK
      this.initAudio();
      this.audioOK = true;
    }
  }
    
  initAudio() {
    this.audio = new AudioContext();
    this.vco = this.audio.createOscillator();
    this.vco.type = this.vco.SINE;
    this.vco.frequency.value = 440;
    this.vco.start(0);
    this.vca = this.audio.createGain();
    this.vca.gain.value = 0;
    this.vco.connect(this.vca);
    this.vca.connect(this.audio.destination);
  }
  
  setFrequency(f) {
    if(this.audioOK)
      this.vco.frequency.value = f;
  }
  
  setGain(g) {
    if(this.audioOK)
      this.vca.gain.value = g;
  }
}

class NoteFrequencyTable extends Component {
  constructor(props) {
    super(props);
    this.synth = new Synth();
  }
  
   handleMouseDown(evt) {
    this.synth.setGain(0.1);
  }
  
  handleMouseUp(evt) {
    this.synth.setGain(0);
  }
  
  handleHover(evt) {
    this.synth.setFrequency(evt.target.textContent);
  }
  
  render() {
    const numOctaves=10;
    var base = this.props.baseFreq;
    
    /* 
    // for browsers that cannot display unicode sharps and flats:
    const sharpSymbol = '#';
    const flatSymbol = 'b'; 
    */
        
    const sharpSymbol = '\u266f';
    const flatSymbol = '\u266d'; 
        
    const pitchClasses = ["C",
      "C" + sharpSymbol + " / D" + flatSymbol,
      "D",
      "D" + sharpSymbol + " / E" + flatSymbol,
      "E",
      "F",
      "F" + sharpSymbol + " / G" + flatSymbol,
      "G",
      "G" + sharpSymbol + " / A" + flatSymbol,
      "A",
      "A" + sharpSymbol + " / B" + flatSymbol,
      "B"];
       
    var TableHeader1 = (
      <tr>
          <th className="tbl-pitchlabel" key="pl1"></th>
          <th className="tbl-octavelabel" key="ol1" colSpan={numOctaves}>Octave</th>
      </tr>
    );
    
    var TableHeaderLabels = [];
    TableHeaderLabels.push(<td className="tbl-pitchlabel" key="pl2">Pitch Class</td>);
    
    for (var oct=0; oct < numOctaves; ++oct){
      TableHeaderLabels.push(<td className="tbl-octavelabel" key={"ol2-"+oct}>{oct}</td>); 
    }
    
    var Tableheader2 = (<tr>{TableHeaderLabels}</tr>);
    
    var Rows = [];
    
    // Populate Rows with Note Name, followed by note frequencies for each octave:
    for (var pitch=0; pitch < pitchClasses.length; ++pitch ){
      var rowData = [];
      rowData.push(<td className="tbl-pitchname" key={1024+pitch}>{pitchClasses[pitch]}</td>); // Name of Note
      for (var octave=0; octave < numOctaves; ++octave){
          var freq = calcFrequency(
            base, 
            pitch-9, // 'C' is 9 semitones below 'A' 
            octave);
          rowData.push(<td className="tbl-frequency" key={(octave*12)+pitch}  onMouseOver={this.handleHover.bind(this)}>{freq.toPrecision(6)}</td>); // Frequency
      } 
      Rows.push(<tr key={"row-"+pitch} >{rowData}</tr>);
    }
    
    return (
      <div onMouseDown={this.handleMouseDown.bind(this)} onMouseUp={this.handleMouseUp.bind(this)}>
        <br />
        <table className="tbl">
          <thead>
            {TableHeader1}
            {Tableheader2}
          </thead>
          <tbody>
            {Rows}
          </tbody>
        </table>
      </div>
    );
  }
}

function calcFrequency(base,pitch,octave){
  // For a twelve-tone, equally-tempered tuning,
  // frequency is given by the general formula:
  // freq = baseFreq * 2 ^ (intervalInSemitones / 12 )
  
  return base * Math.pow(2, (octave-4) + (pitch / 12.0)); // center around octave == 4, pitch == 0 
}

function isBrowserIE() {
  var ua = window.navigator.userAgent;
  var rv = false; 
 
  if (ua.indexOf('MSIE ') > 0) { // IE 10 or older 
    rv = true;
  }

  if (ua.indexOf('Trident/') > 0) { // IE 11
    rv = true;
  }
  return rv;
}

export default App;
