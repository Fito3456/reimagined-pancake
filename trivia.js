let preguntas = []
let misRespuestas = Array(10);
let currentQuestionIndex = 0;

document.addEventListener("DOMContentLoaded", function(){
    let token = sessionStorage.getItem("token")
    if(token){
        console.log("Token encontrado" , token)
    } else{
        generarToken()
    }
    
    // Crear bolas de Navidad colgando
    crearBolasNavidad();
    
    // Agregar botón de pantalla completa
    agregarBotonPantallaCompleta();
    
    // Detectar cambios en pantalla completa
    document.addEventListener('fullscreenchange', actualizarIndicadorPantallaCompleta);
    document.addEventListener('webkitfullscreenchange', actualizarIndicadorPantallaCompleta);
    document.addEventListener('mozfullscreenchange', actualizarIndicadorPantallaCompleta);
    document.addEventListener('MSFullscreenChange', actualizarIndicadorPantallaCompleta);
})

function crearBolasNavidad() {
    const container = document.createElement('div');
    container.className = 'christmas-ornaments';
    
    const colores = ['🔴', '🟡', '🔵', '🟢', '🟣'];
    colores.forEach((color, index) => {
        const ornament = document.createElement('div');
        ornament.className = 'ornament';
        ornament.style.animationDelay = `${index * 0.5}s`;
        ornament.innerHTML = `
            <div class="ornament-string"></div>
            <div class="ornament-ball">${color}</div>
        `;
        container.appendChild(ornament);
    });
    
    document.body.insertBefore(container, document.body.firstChild);
}

function agregarBotonPantallaCompleta() {
    const btn = document.createElement('button');
    btn.className = 'fullscreen-btn';
    btn.id = 'fullscreenBtn';
    btn.innerHTML = `
        <span id="fullscreenIcon">⛶</span>
        <span class="tooltip" id="fullscreenTooltip">Pantalla completa</span>
    `;
    btn.onclick = toggleFullscreen;
    document.body.appendChild(btn);
    
    // Agregar indicador
    const indicator = document.createElement('div');
    indicator.className = 'fullscreen-indicator';
    indicator.id = 'fullscreenIndicator';
    indicator.innerHTML = '🎮 Modo Pantalla Completa Activado - Presiona ESC para salir';
    document.body.appendChild(indicator);
}

function toggleFullscreen() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && !document.msFullscreenElement) {
        // Entrar en pantalla completa
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    } else {
        // Salir de pantalla completa
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

function actualizarIndicadorPantallaCompleta() {
    const icon = document.getElementById('fullscreenIcon');
    const tooltip = document.getElementById('fullscreenTooltip');
    const indicator = document.getElementById('fullscreenIndicator');
    
    if (document.fullscreenElement || document.webkitFullscreenElement || 
        document.mozFullScreenElement || document.msFullscreenElement) {
        // Está en pantalla completa
        icon.textContent = '⛶';
        tooltip.textContent = 'Salir de pantalla completa';
        indicator.classList.add('active');
    } else {
        // No está en pantalla completa
        icon.textContent = '⛶';
        tooltip.textContent = 'Pantalla completa';
        indicator.classList.remove('active');
    }
}

function desordenar (){
    return Math.random()-0.5
}

const generarToken = () => {
    fetch("https://opentdb.com/api_token.php?command=request")
    .then(respuesta => {return respuesta.json()})
    .then(datos => {
        if(datos.token){
            sessionStorage.setItem('token', datos.token);
        }
    })
    .catch(error => {
        console.error("hubo un error generando el token" , error)
    })
}

const obtenerPreguntas = () => {
    let token = sessionStorage.getItem("token");
    if (token){
        const categoria = document.getElementById("select1").value;
        const dificultad = document.getElementById("select2").value;
        const tipo = document.getElementById("select3").value;
    
    if (!categoria === "" || dificultad === "" || tipo === "" ){
        alert("debes seleccionar las opciones correspondientes para continuar");
        return
    }
    else{
        let url = `https://opentdb.com/api.php?amount=10&category=${categoria}&difficulty=${dificultad}&type=${tipo}&token=${token}`;
        fetch(url)
        .then(respuesta => respuesta.json())
        .then(datos => {
            if(datos.results.length > 0 ) {

                datos.results.map(preguntaAPI => {
                    preguntas.push(
                        {
                        pregunta: preguntaAPI.question,
                        respuestaCorrecta:  preguntaAPI.correct_answer,
                        respuestaIncorrecta: preguntaAPI.incorrect_answers,
                        respuestaAletorias:[preguntaAPI.correct_answer,...preguntaAPI.incorrect_answers].sort(desordenar)
                    })
                });
                
                // Crear estructura con panel lateral
                const questionarioSection = document.getElementById("questionario");
                questionarioSection.innerHTML = `
                    <div id="questionario-content">
                        <section id="preguntas"></section>
                    </div>
                    <aside class="side-panel">
                        <div class="side-panel-title">📋 Opciones</div>
                        <button type="button" class="button-90" id="nueva" onclick="reset()">Iniciar nueva trivia</button>
                        <button type="button" class="button-90" id="calificar" onclick="calificar()">Calificar preguntas</button>
                        <button type="button" class="button-90" id="ver" onclick="prueba()">Ver preguntas</button>
                    </aside>
                `;
                
                // Re-agregar las preguntas al nuevo contenedor
                const preguntasContainer = document.getElementById("preguntas");
                preguntas.map((pregunta,indice)=>{
                    const preguntaHTML = document.createElement("div")
                    preguntaHTML.innerHTML = `
                    <h3>${pregunta.pregunta}</h3>
                    <ul>
                      ${pregunta.respuestaAletorias.map(respuesta => `<li class="respuesta"  onclick="agregarRespuestas('${respuesta}','${indice}')">${respuesta}</li>`).join('')}
                    </ul>
                    <div class="navigation-controls">
                        <button class="nav-button prev" onclick="previousQuestion()" id="prevBtn-${indice}">Anterior</button>
                        <span class="question-counter" id="questionCounter-${indice}">Pregunta ${indice + 1} de ${preguntas.length}</span>
                        <button class="nav-button next" onclick="nextQuestion()" id="nextBtn-${indice}">Siguiente</button>
                    </div>
                  `;
                    preguntasContainer.appendChild(preguntaHTML)
                })
                
                showQuestion(0);
                document.getElementById("form").hidden=true
                document.getElementById('questionario').hidden= false
            }else{
                document.getElementById('questionario').hidden= true
                alert("No hay una trivia disponible con las caracteristicas seleccionadas, por favor cambie los valores e intentalo de nuevo")
            }
        })
        .catch(error => console.error("hubo un error generando las preguntas", error))
    }}
    else{
        generarToken()
    }
}

const showQuestion = (index) => {
    const allQuestions = document.querySelectorAll("#preguntas > div");
    allQuestions.forEach((q, i) => {
        q.classList.remove("active");
        if(i === index) {
            q.classList.add("active");
        }
    });
    
    currentQuestionIndex = index;
    
    // Actualizar estado de botones en la pregunta activa
    const prevBtn = document.getElementById(`prevBtn-${index}`);
    const nextBtn = document.getElementById(`nextBtn-${index}`);
    
    if(prevBtn) prevBtn.disabled = index === 0;
    if(nextBtn) nextBtn.disabled = index === preguntas.length - 1;
    
    // Ocultar botón siguiente en la última pregunta
    if(nextBtn && index === preguntas.length - 1) {
        nextBtn.style.display = "none";
    } else if(nextBtn) {
        nextBtn.style.display = "inline-block";
    }
}

const nextQuestion = () => {
    if(currentQuestionIndex < preguntas.length - 1) {
        showQuestion(currentQuestionIndex + 1);
    }
}

const previousQuestion = () => {
    if(currentQuestionIndex > 0) {
        showQuestion(currentQuestionIndex - 1);
    }
}

const checkPreguntas = () =>{
    document.getElementById("questionario").hidden
}

const reset= () => {
    document.getElementById("questionario").hidden=true
    document.getElementById("form").hidden=false
    preguntas = [];
    misRespuestas = Array(10);
    currentQuestionIndex = 0;
    
    // Resetear selects
    document.getElementById("select1").selectedIndex = 0;
    document.getElementById("select2").selectedIndex = 0;
    document.getElementById("select3").selectedIndex = 0;
}

const agregarRespuestas = (respuesta, indice)=>{
    misRespuestas[indice]=respuesta;
    actualizarEstilos(indice)
}

const prueba = ()=>{
    console.log(misRespuestas)
}

function checklleno(){
    return misRespuestas.every(elemento =>{
        return elemento !==undefined && elemento !== null
    })
}

const calificar =()=> {
    let puntaje = 0;
    if(checklleno()){
        misRespuestas.map((respuesta, indice)=>{
            if(respuesta===preguntas[indice].respuestaCorrecta) {puntaje = puntaje + 100}
            else aplicarEstiosCorrecto(indice)
            console.log(puntaje)
        })
        alert(`Tu puntaje es de  ${puntaje} puntos`)
        
        // Mostrar todas las preguntas después de calificar
        const allQuestions = document.querySelectorAll("#preguntas > div");
        allQuestions.forEach(q => q.classList.add("active"));
    }else alert("debes llenar todas las respuestas")
}

function actualizarEstilos(indice){
    console.log(indice)
    const preguntasDiv = document.querySelectorAll("#preguntas > div");
    const lista = preguntasDiv[indice].querySelector("ul");
    const respuestaHtml = lista.children;

    for(let  i = 0 ;i<respuestaHtml.length; i++){
        respuestaHtml[i].classList.remove("seleccionada") ;
}

    const respuestaSeleccionada = misRespuestas[indice]
    const elementoSeleccionado = Array.from(lista.children).find(elemento => elemento.innerText === respuestaSeleccionada)
    if(elementoSeleccionado){
        elementoSeleccionado.classList.add("seleccionada");
}
}

const aplicarEstiosCorrecto = (indice) =>{
    const preguntasDiv = document.querySelectorAll("#preguntas > div");
    const lista = preguntasDiv[indice].querySelector("ul");
    const respuestaHtml = Array.from(lista.children);

    const respuestaCorrecta = preguntas[indice].respuestaCorrecta;
    const elementoCorrecta = respuestaHtml.find(elemento => elemento.innerHTML === respuestaCorrecta)

    if (elementoCorrecta) {
        elementoCorrecta.classList.add("respuesta-correcta")
         
    }

}