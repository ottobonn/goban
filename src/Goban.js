import React, {Component} from 'react';
import {SceneManager} from './SceneManager';

class Goban extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
  }
  render() {
    return (
      <canvas id="main" ref={this.canvasRef}></canvas>
    );
  }
  componentDidMount(){
    const sceneManager = new SceneManager({
      canvas: this.canvasRef.current,
    });
    const animate = () => {
      this.animationFrameRequest = requestAnimationFrame(animate);
      sceneManager.animate({
        width: this.props.width,
        height: this.props.height,
      });
    }
    animate();
  }
}

export {Goban};
