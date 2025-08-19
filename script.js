(function(){
    // canvas e contexto
    var cnv = document.querySelector("canvas");
    var ctx = cnv.getContext("2d");
    var WIDTH = cnv.width, HEIGHT = cnv.height;

    // teclas
    var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
    var mvLeft = false, mvUp = false, mvRight = false, mvDown = false;

    // tiles
    var tileSize = 96;
    var tileSrcSize = 192;

    // imagem do tilesheet
    var img = new Image();
    img.src = "img/img.png";
    img.addEventListener("load", function(){
        requestAnimationFrame(loop);
    }, false);

    // paredes
    var walls = [];

    // jogador
    var player = {
        x: tileSize + 2,
        y: tileSize + 2,
        width: 48,
        height: 64,
        speed: 4,
        srcX: 0,
        srcY: tileSrcSize,
        countAnim: 0
    };

    // mapa
    var maze = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1],
        [1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,0,1,0,1,1,1,1,1],
        [1,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,1,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,1,1,1,0,0,0,0,1,0,1,0,0,0,0,0,1],
        [1,0,1,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
        [1,0,1,0,0,1,1,1,1,1,0,0,0,0,1,0,1,1,1,0,0,0,1,0,1],
        [1,0,1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,0,1,0,1],
        [1,0,1,1,1,1,0,0,1,0,0,1,0,0,1,1,0,0,0,0,0,0,1,0,1],
        [1,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
        [1,0,1,0,0,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,0,1],
        [1,0,1,0,1,1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,1],
        [1,0,1,0,0,1,0,0,1,0,1,1,0,0,1,0,0,1,1,0,1,0,0,0,1],
        [1,0,1,1,0,1,1,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1],
        [1,0,1,0,0,1,0,0,1,0,0,0,0,0,1,1,0,1,0,0,0,0,1,0,1],
        [1,0,1,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1],
        [1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,0,1],
        [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,1,0,1],
        [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,1]
    ];

    var T_WIDTH = maze[0].length * tileSize;
    var T_HEIGHT = maze.length * tileSize;

    // paredes
    for(let row=0; row<maze.length; row++){
        for(let column=0; column<maze[row].length; column++){
            if(maze[row][column] === 1){
                walls.push({
                    x: column * tileSize,
                    y: row * tileSize,
                    width: tileSize,
                    height: tileSize
                });
            }
        }
    }

    // câmera
    var cam = {
        x: 0,
        y: 0,
        width: WIDTH,
        height: HEIGHT,
        innerLeftBoundary: function(){ return this.x + (this.width*0.25); },
        innerTopBoundary: function(){ return this.y + (this.height*0.25); },
        innerRightBoundary: function(){ return this.x + (this.width*0.75); },
        innerBottomBoundary: function(){ return this.y + (this.height*0.75); }
    };

    // colisão
    function blockRectangle(objA,objB){
        var distX = (objA.x + objA.width/2) - (objB.x + objB.width/2);
        var distY = (objA.y + objA.height/2) - (objB.y + objB.height/2);
        var sumWidth = (objA.width + objB.width)/2;
        var sumHeight = (objA.height + objB.height)/2;
        if(Math.abs(distX) < sumWidth && Math.abs(distY) < sumHeight){
            var overlapX = sumWidth - Math.abs(distX);
            var overlapY = sumHeight - Math.abs(distY);
            if(overlapX > overlapY){
                objA.y = distY > 0 ? objA.y + overlapY : objA.y - overlapY;
            } else {
                objA.x = distX > 0 ? objA.x + overlapX : objA.x - overlapX;
            }
        }
    }

    // eventos de teclado
    window.addEventListener("keydown", function(e){
        switch(e.keyCode){
            case LEFT: mvLeft = true; break;
            case UP: mvUp = true; break;
            case RIGHT: mvRight = true; break;
            case DOWN: mvDown = true; break;
        }
    }, false);

    window.addEventListener("keyup", function(e){
        switch(e.keyCode){
            case LEFT: mvLeft = false; break;
            case UP: mvUp = false; break;
            case RIGHT: mvRight = false; break;
            case DOWN: mvDown = false; break;
        }
    }, false);

    // flag global
    var gamePaused = false;

    // update
    function update(){
        if(mvLeft && !mvRight){ player.x -= player.speed; player.srcY = tileSrcSize + player.height*2; }
        else if(mvRight && !mvLeft){ player.x += player.speed; player.srcY = tileSrcSize + player.height*3; }
        if(mvUp && !mvDown){ player.y -= player.speed; player.srcY = tileSrcSize + player.height*1; }
        else if(mvDown && !mvUp){ player.y += player.speed; player.srcY = tileSrcSize + player.height*0; }

        // animação
        if(mvLeft || mvRight || mvUp || mvDown){
            player.countAnim++;
            if(player.countAnim >= 40) player.countAnim = 0;
            player.srcX = Math.floor(player.countAnim/5) * player.width;
        } else { player.srcX = 0; player.countAnim = 0; }

        // colisão
        for(let i=0; i<walls.length; i++) blockRectangle(player, walls[i]);

        // câmera
        if(player.x < cam.innerLeftBoundary()) cam.x = player.x - cam.width*0.25;
        if(player.y < cam.innerTopBoundary()) cam.y = player.y - cam.height*0.25;
        if(player.x + player.width > cam.innerRightBoundary()) cam.x = player.x + player.width - cam.width*0.75;
        if(player.y + player.height > cam.innerBottomBoundary()) cam.y = player.y + player.height - cam.height*0.75;
        cam.x = Math.max(0, Math.min(T_WIDTH - cam.width, cam.x));
        cam.y = Math.max(0, Math.min(T_HEIGHT - cam.height, cam.y));

        // checar final
        var row = Math.floor(player.y / tileSize);
        var col = Math.floor(player.x / tileSize);
        if(maze[row][col] === 2){ showInvitation(); return; }
    }

    // render
    function render(){
        ctx.clearRect(0,0,WIDTH,HEIGHT);
        ctx.save();
        ctx.translate(-cam.x,-cam.y);
        for(let row=0; row<maze.length; row++){
            for(let col=0; col<maze[row].length; col++){
                let tile = maze[row][col];
                ctx.drawImage(img, tile*tileSrcSize,0,tileSrcSize,tileSrcSize, col*tileSize,row*tileSize, tileSize,tileSize);
            }
        }
        ctx.drawImage(img, player.srcX,player.srcY,player.width,player.height, player.x,player.y,player.width,player.height);
        ctx.restore();
    }

    // loop
    function loop(){
        if(!gamePaused){ update(); render(); requestAnimationFrame(loop); }
    }

    // final do jogo e balões
    function showInvitation(){
        gamePaused = true;
        document.getElementById("canvas_div").style.display = "none";
        const invitation = document.getElementById("invitation");
        invitation.style.display = "flex";
        const balloonContainer = document.getElementById("balloon-container");
        const colors = ["red","blue","green","yellow","purple","pink"];

        const balloonInterval = setInterval(()=>{
            const count = 2 + Math.floor(Math.random()*2);
            for(let i=0;i<count;i++){
                const balloon = document.createElement("div");
                balloon.classList.add("balloon");
                const color = colors[Math.floor(Math.random()*colors.length)];
                balloon.classList.add(color);
                balloon.innerHTML = "🎈";
                balloon.style.fontSize = (20 + Math.random()*40)+"px";
                balloon.style.left = Math.random()*90+"vw";
                balloon.style.animationDuration = (5 + Math.random()*3)+"s";
                balloonContainer.appendChild(balloon);
                setTimeout(()=>balloon.remove(),8000);
            }
        },200);

       setTimeout(()=>{ clearInterval(balloonInterval); },7000);
}

// ✅ exposta globalmente para os botões funcionarem
window.showFinal = function(){
    document.getElementById("invitation").style.display = "none";
    document.getElementById("finalScreen").style.display = "flex";
};

})();



