(function(){
let canvas = document.querySelector("canvas");
let renderizacao = canvas.getContext("2d");

let left = 37, up = 38, right = 39, down = 40;
let mvLeft = mvUp = mvRight = mvDown = false;

let tamanhoCelula = 64;

let personagem = {
    x: tamanhoCelula + 2,
    y: tamanhoCelula + 2,
    width: 28,
    height: 28,
    speed: 2
};

let canvasAltura = canvas.width, canvasLargura = canvas.height;

let paredes = [];


let labirinto = [
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

for(let linha in labirinto){
		for(let coluna in labirinto[linha]){
			let elemento = labirinto[linha][coluna];
			if(elemento === 1){
				let parede = {
					x: tamanhoCelula*coluna,
					y: tamanhoCelula*linha,
					width: tamanhoCelula,
					height: tamanhoCelula
				};
				paredes.push(parede);
			}
		}
	}

    function retangulo(objA,objB){
        let distanciaX = (objA.x + objA.width/2) - (objB.x + objB.width/2);
        let distanciaY = (objA.y + objA.height/2) - (objB.y + objB.height/2);

        let somaLargura = (objA.width + objB.width)/2;
        let somaAltura = (objA.height + objB.height)/2;

        if (Math.abs(distanciaX) < somaLargura && Math.abs(distanciaY) < somaAltura) {
            let sobreposicaoX = somaLargura - Math.abs(distanciaX);
            let sobreposicaoY = somaAltura - Math.abs(distanciaY);

            if (sobreposicaoX > sobreposicaoY) {
                objA.y = distanciaY > 0 ? objA.y + sobreposicaoY : objA.y - sobreposicaoY;
            } else {
                objA.x = distanciaX > 0 ? objA.x + sobreposicaoX : objA.x - sobreposicaoX;
            }

        }
    }

window.addEventListener("keydown", teclaApertada, false);
window.addEventListener("keyup", teclaSolta, false);

function teclaApertada(event){
    let tecla = event.keyCode;
    switch(tecla){
        case left:
            mvLeft = true;
            break;
        case up:
            mvUp = true;
            break;
        case right:
            mvRight = true;
            break;
        case down:
            mvDown = true;
            break;
    }
}

function teclaSolta(event){
    let tecla = event.keyCode;
    switch(tecla){
        case left:
            mvLeft = false;
            break;
        case up:
            mvUp = false;
            break;
        case right:
            mvRight = false;
            break;
        case down:
            mvDown = false;
            break;
    }
};

function atualizar() {
    if (mvLeft && !mvRight) {
        personagem.x -= personagem.speed;
    } 
    else if (mvRight && !mvLeft) {
        personagem.x += personagem.speed;
    }

    if (mvUp && !mvDown) {
        personagem.y -= personagem.speed;
    } 
    else if (mvDown && !mvUp) {
        personagem.y += personagem.speed;
    }

    for(let i in paredes){
        let parede = paredes[i];
        retangulo(personagem,parede);
    }

}
function renderizar() {
    renderizacao.clearRect(0,0, canvasAltura, canvasLargura);
    renderizacao.save();
    for (let linha in labirinto) {
    for (let coluna in labirinto[linha]) {
        let elemento = labirinto[linha][coluna];
        if (elemento === 1) {
            let x = coluna * tamanhoCelula;
            let y = linha * tamanhoCelula;
            renderizacao.fillRect(x, y, tamanhoCelula, tamanhoCelula);
        }
    }
}

    renderizacao.fillStyle = "#00f";
    renderizacao.fillRect(personagem.x,personagem.y,personagem.height,personagem.width);
    renderizacao.restore();
};

function loop() {
    atualizar();
    renderizar();
    requestAnimationFrame(loop,canvas);
};

requestAnimationFrame(loop,canvas);

}());