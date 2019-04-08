(function() {

    var canvas = new fabric.Canvas('c', {selection: false });

    var rect, isDown, origX, origY;
    var shapes = [];

    var height = 668;
    var width = 1000;
    var grid_x = width/(6*12);
    var grid_y = height/(4*12);

    /* Cretae background gradient */
    rect = new fabric.Rect({
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
    canvas.add(rect);
    rect = null;

    canvas.add(new fabric.Line([ 
        Math.round(width/3/grid_x)*grid_x, 0, 
        Math.round(width/3/grid_x)*grid_x, height], {
        stroke: 'grey',
        selectable: false
    }));

    canvas.add(new fabric.Line([ 
        Math.round(2*width/3/grid_x)*grid_x, 0, 
        Math.round(2*width/3/grid_x)*grid_x, height], {
        stroke: 'grey',
        selectable: false
    }));

    canvas.add(new fabric.Line([ 
        0, Math.round(height/2/grid_y)*grid_y, 
        width, Math.round(height/2/grid_y)*grid_y], {
        stroke: 'grey',
        selectable: false
    }));



    /* Snap to grid logic */
    canvas.on('object:moving', function(o){
        o.target.set({
            left: Math.round(o.target.left/grid_x)*grid_x,
            top: Math.round(o.target.top/grid_y)*grid_y
        })
    });

    canvas.on('object:scaling', options => {
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
       }
       target.set(attrs);
    });


     createRectMouseDown = function(o){
        isDown = true;
        var pointer = canvas.getPointer(o.e);
        origX = pointer.x;
        origY = pointer.y;
        var pointer = canvas.getPointer(o.e);
        rect = new fabric.Rect({
            left: Math.round(origX/grid_x)*grid_x,
            top: Math.round(origY/grid_y)*grid_y,
            originX: 'left',
            originY: 'top',
            width: Math.round((pointer.x-origX)/grid_x)*grid_x,
            height: Math.round((pointer.y-origY)/grid_y)*grid_y,
            angle: 0,
            fill: 'rgba(255,0,0,0.5)',
            transparentCorners: false
        });
        canvas.add(rect);
        shapes.push(rect);
    }
    canvas.on('mouse:down', createRectMouseDown);

    createRectMouseMove =  function(o){
        if (!isDown) return;
        var pointer = canvas.getPointer(o.e);
        
        if(origX>pointer.x){
            rect.set({ left: Math.round(Math.abs(pointer.x)/grid_x)*grid_x });
        }
        if(origY>pointer.y){
            rect.set({ top: Math.round(Math.abs(pointer.y)/grid_x)*grid_x });
        }
        
        rect.set({ width: Math.round(Math.abs(origX - pointer.x)/grid_x)*grid_x });
        rect.set({ height: Math.round(Math.abs(origY - pointer.y)/grid_y)*grid_y });

        rect.setCoords()
        
        canvas.renderAll();
    }
    canvas.on('mouse:move', createRectMouseMove);

    createRectMouseUp = function(o){
      isDown = false;

      canvas.off('mouse:down', createRectMouseDown);
      canvas.off('mouse:move', createRectMouseMove);
      canvas.off('mouse:up', createRectMouseUp);
    }
    canvas.on('mouse:up', createRectMouseUp);



    function printPlan(){
        simplemde.togglePreview()

        setTimeout(() => {
        simplemde.gui.toolbar.style.display = "none"
        window.print()
        simplemde.gui.toolbar.style.display = ""
        simplemde.togglePreview()
        }, 100);
    }
    window.printPlan = printPlan;

    function createRect(){
        // remove first to make sure we don't add two handlers
        canvas.off('mouse:down', createRectMouseDown);
        canvas.off('mouse:move', createRectMouseMove);
        canvas.off('mouse:up', createRectMouseUp);
        // now we can add safely.
        canvas.on('mouse:down', createRectMouseDown);
        canvas.on('mouse:move', createRectMouseMove);
        canvas.on('mouse:up', createRectMouseUp);
        disable_selectable();
    }
    window.createRect = createRect

    function deleteRect(){
        var rect = canvas.getActiveObject()
        canvas.remove(rect);
    }
    window.deleteRect = deleteRect

    function enable_selectable(){
        canvas.selection = true;
        for(var e of shapes){
            e.set({selectable: true});
        }
        window.click_mode = null;
    }

    function disable_selectable(){
        canvas.selection = false;
        for(var e of shapes){
            e.set({selectable: false});
        }
    }

    function changeObjectColor(){
        var color = prompt("Color to set. Can be the name of a color (red, blue, green) or a hex value for a color (#adada3).")
        var c = new fabric.Color(color);
        c.setAlpha(0.5)
        canvas.getActiveObject().set("fill", c.toRgba())
        canvas.renderAll()
    }
    window.changeObjectColor = changeObjectColor;

})();
