import React from 'react';
import SimpleMDE from "react-simplemde-editor";
import {fabric} from 'fabric';


class FabricCanvas extends React.Component{
    state = {
        height: 668,
        width: 1000,
        grid_x: 0,
        grid_y: 0,
        is_down: false,
    }

    constructor() {
        super();

        this.state.grid_x = this.state.width/(6*12);
        this.state.grid_y = this.state.height/(4*12);
        this.rect = null;
        this.shapes = [];

    }

    componentDidMount(){
        var grid_x = this.state.grid_x;
        var grid_y = this.state.grid_y;
        var height = this.state.height;
        var width = this.state.width;

        // Make a New Canvas
        this.canvas = new fabric.StaticCanvas('main-canvas', {
            preserveObjectStacking: true,
            height: height,
            width: width,
        });


        var rect = new fabric.Rect({
          left: 0,
          top: 0,
          width: width,
          height: height,
          selectable: false
        });

        rect.setGradient('fill', {
            type: 'radial',
            r1: rect.width / 2,
            r2: 10,
            x1: rect.width / 2,
            y1: rect.height / 2,
            x2: rect.width / 2,
            y2: rect.height / 2,
            colorStops: {
                0: '#B4AB8F',
                0.5: '#CDC8AB',
                1: '#D0D0D0'
            }
        });
        this.canvas.add(rect);
        rect = null;

        this.canvas.add(new fabric.Line([ 
            Math.round(width/3/grid_x)*grid_x, 0, 
            Math.round(width/3/grid_x)*grid_x, height], {
            stroke: 'grey',
            selectable: false
        }));

        this.canvas.add(new fabric.Line([ 
            Math.round(2*width/3/grid_x)*grid_x, 0, 
            Math.round(2*width/3/grid_x)*grid_x, height], {
            stroke: 'grey',
            selectable: false
        }));

        this.canvas.add(new fabric.Line([ 
            0, Math.round(height/2/grid_y)*grid_y, 
            width, Math.round(height/2/grid_y)*grid_y], {
            stroke: 'grey',
            selectable: false
        }));

        this.canvas.on('object:moving', function(o){
            o.target.set({
                left: Math.round(o.target.left/grid_x)*grid_x,
                top: Math.round(o.target.top/grid_y)*grid_y
            })
        });

        this.canvas.on('object:scaling', options => {
           var target = options.target,
              w = target.width * target.scaleX,
              h = target.height * target.scaleY,
              snap = { // Closest snapping points
                 top: Math.round(target.top / grid_y) * grid_y,
                 left: Math.round(target.left / grid_x) * grid_x,
                 bottom: Math.round((target.top + h) / grid_y) * grid_y,
                 right: Math.round((target.left + w) / grid_x) * grid_x
              },
              threshold_x = grid_x,
              threshold_y = grid_y,
              dist = { // Distance from snapping points
                 top: Math.abs(snap.top - target.top),
                 left: Math.abs(snap.left - target.left),
                 bottom: Math.abs(snap.bottom - target.top - h),
                 right: Math.abs(snap.right - target.left - w)
              },
              attrs = {
                 scaleX: target.scaleX,
                 scaleY: target.scaleY,
                 top: target.top,
                 left: target.left
              };
           switch (target.__corner) {
              case 'tl':
                 if (dist.left < dist.top && dist.left < threshold_x) {
                    attrs.scaleX = (w - (snap.left - target.left)) / target.width;
                    attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
                    attrs.top = target.top + (h - target.height * attrs.scaleY);
                    attrs.left = snap.left;
                 } else if (dist.top < threshold_y) {
                    attrs.scaleY = (h - (snap.top - target.top)) / target.height;
                    attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
                    attrs.left = attrs.left + (w - target.width * attrs.scaleX);
                    attrs.top = snap.top;
                 }
                 break;
              case 'mt':
                 if (dist.top < threshold_y) {
                    attrs.scaleY = (h - (snap.top - target.top)) / target.height;
                    attrs.top = snap.top;
                 }
                 break;
              case 'tr':
                 if (dist.right < dist.top && dist.right < threshold_x) {
                    attrs.scaleX = (snap.right - target.left) / target.width;
                    attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
                    attrs.top = target.top + (h - target.height * attrs.scaleY);
                 } else if (dist.top < threshold_y) {
                    attrs.scaleY = (h - (snap.top - target.top)) / target.height;
                    attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
                    attrs.top = snap.top;
                 }
                 break;
              case 'ml':
                 if (dist.left < threshold_x) {
                    attrs.scaleX = (w - (snap.left - target.left)) / target.width;
                    attrs.left = snap.left;
                 }
                 break;
              case 'mr':
                 if (dist.right < threshold_x) attrs.scaleX = (snap.right - target.left) / target.width;
                 break;
              case 'bl':
                 if (dist.left < dist.bottom && dist.left < threshold_x) {
                    attrs.scaleX = (w - (snap.left - target.left)) / target.width;
                    attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
                    attrs.left = snap.left;
                 } else if (dist.bottom < threshold_y) {
                    attrs.scaleY = (snap.bottom - target.top) / target.height;
                    attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
                    attrs.left = attrs.left + (w - target.width * attrs.scaleX);
                 }
                 break;
              case 'mb':
                 if (dist.bottom < threshold_y) attrs.scaleY = (snap.bottom - target.top) / target.height;
                 break;
              case 'br':
                 if (dist.right < dist.bottom && dist.right < threshold_x) {
                    attrs.scaleX = (snap.right - target.left) / target.width;
                    attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
                 } else if (dist.bottom < threshold_y) {
                    attrs.scaleY = (snap.bottom - target.top) / target.height;
                    attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
                 }
                 break;
              default:
                  break;
           }
           target.set(attrs);
        });

    }

    componentWillReceiveProps = (newprops) =>{

        // If Updated Item is not the same as the old one
        //         => Update the canvas with newer item
        if(newprops.activeProperty !== this.props.activeProperty){
            this.updateCanvasforImage(this.props.activeProperty,newprops.activeProperty);
        }
    }

    printPlan (){
        this.state.simplemde.togglePreview()

        setTimeout(() => {
        SimpleMDE.gui.toolbar.style.display = "none"
        window.print()
        SimpleMDE.gui.toolbar.style.display = ""
        SimpleMDE.togglePreview()
        }, 100);
    }

    createRectMouseMove (o){
        if (!this.state.is_down) return;
        var pointer = this.canvas.getPointer(o.e);
        
        if(this.state.origX>pointer.x){
            this.rect.set({ left: Math.round(Math.abs(pointer.x)/this.state.grid_x)*this.state.grid_x });
        }
        if(this.state.origY>pointer.y){
            this.rect.set({ top: Math.round(Math.abs(pointer.y)/this.state.grid_y)*this.state.grid_y });
        }
        
        this.rect.set({ width: Math.round(Math.abs(this.state.origX - pointer.x)/this.state.grid_x)*this.state.grid_x });
        this.rect.set({ height: Math.round(Math.abs(this.state.origY - pointer.y)/this.state.grid_y)*this.state.grid_y });

        this.rect.setCoords()
        
        this.canvas.renderAll();
    }

    createRectMouseUp(o){
      this.state.set({is_down: false});

      this.canvas.off('mouse:down', this.createRectMouseDown);
      this.canvas.off('mouse:move', this.createRectMouseMove);
      this.canvas.off('mouse:up', this.thiscreateRectMouseUp);

    }

    createRectMouseDown(o){
        this.state.set({is_down: true});
        var pointer = this.canvas.getPointer(o.e);
        this.origX = pointer.x;
        this.origY = pointer.y;
        var pointer = this.canvas.getPointer(o.e);
        this.rect = new fabric.Rect({
            left: Math.round(this.origX/this.grid_x)*this.grid_x,
            top: Math.round(this.origY/this.grid_y)*this.grid_y,
            originX: 'left',
            originY: 'top',
            width: Math.round((pointer.x-this.origX)/this.grid_x)*this.grid_x,
            height: Math.round((pointer.y-this.origY)/this.grid_y)*this.grid_y,
            angle: 0,
            fill: 'rgba(255,0,0,0.5)',
            transparentCorners: false
        });
        this.canvas.add(this.rect);
        this.shapes.push(this.rect);
    }

    createRect(){
        debugger;
        // remove first to make sure we don't add two handlers
        this.canvas.off('mouse:down', this.createRectMouseDown);
        this.canvas.off('mouse:move', this.createRectMouseMove);
        this.canvas.off('mouse:up', this.createRectMouseUp);
        // now we can add safely.
        this.canvas.on('mouse:down', this.createRectMouseDown);
        this.canvas.on('mouse:move', this.createRectMouseMove);
        this.canvas.on('mouse:up', this.createRectMouseUp);
        this.disable_selectable();
    }

    enable_selectable(){
        this.canvas.selection = true;
        for(var e of this.shapes){
            e.set({selectable: true});
        }
    }

    disable_selectable(){
        this.canvas.selection = false;
        for(var e of this.shapes){
            e.set({selectable: false});
        }
    }

    deleteRect (){
        var rect = this.canvas.getActiveObject()
        this.canvas.remove(rect);
        this.shapes.remove(rect);
    }

    changeObjectColor (){

    }

    getInstance (instance){
        this.setState({simplemde: instance});
    }




    render(){

        return (
            <div height={this.state.height} width={this.state.width}>

                <canvas id="main-canvas"  style={{"border":"1px solid #ccc"}}>
                </canvas>

                <br/>
                <button onMouseDown={this.printPlan}>Print Plan</button>
                <button onMouseDown={()=>{this.createRect()}}>Create Rect</button>
                <button onMouseDown={this.deleteRect}>Delete Selected Object</button>
                <button onMouseDown={this.changeObjectColor()}>Change Object Color</button>

            </div>
        );
    }
}

export default FabricCanvas;
