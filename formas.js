function formas() {
    var pontuacao_1 = 0;
    var pontuacao_2 = 0;
    var coelho_trapalhao = 0;
    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
  
    if (!gl) {
        throw new Error('WebGL not supported');
    }
  
    var vertexShaderSource = document.querySelector("#vertex-shader").text;
    var fragmentShaderSource = document.querySelector("#fragment-shader").text;
  
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    var program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);
  
    const positionBuffer = gl.createBuffer();
    const positionLocation = gl.getAttribLocation(program, `aPosition`);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
  
    const normalBuffer = gl.createBuffer();
    const normalLocation = gl.getAttribLocation(program, `aNormal`);
    gl.enableVertexAttribArray(normalLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
  
    var ambientReflectionLocation = gl.getUniformLocation(program, `uAmbientReflection`);
    var diffuseReflectionLocation = gl.getUniformLocation(program, `uDiffuseReflection`);
    var specularReflectionLocation = gl.getUniformLocation(program, `uSpecularReflection`);
  
    const modelMatrixUniformLocation = gl.getUniformLocation(program, `uModelMatrix`);
    const viewMatrixUniformLocation = gl.getUniformLocation(program, `uViewMatrix`);
    const projectionMatrixUniformLocation = gl.getUniformLocation(program, `uProjectionMatrix`);
    const inverseTransposeModelMatrixUniformLocation = gl.getUniformLocation(program, `uInverseTransposeModelMatrix`);
    var lightPositionLocation = gl.getUniformLocation(program, `uLightPosition`);
    var viewPositionLocation = gl.getUniformLocation(program, `uViewPosition`);
    var shininessLocation = gl.getUniformLocation(program, `uShininess`);
  
    gl.uniform3fv(lightPositionLocation, new Float32Array([0.0, 0.0, 2.0]));
    gl.uniform1f(shininessLocation, 250.0);
  
    gl.clearColor(0.6, 0.6, 0.6, 1.0);
    gl.viewport(0, 0, 500, 500);
  
    
    let vertexData = [];
  
  
    P0 = [0.0, 0.0, 5.0];
    P_ref = [0.0, 0.0, 0.0];
    V = [0.0, 3.0, 0.0];
    let viewingMatrix = set3dViewingMatrix(P0, P_ref, V);
    xw_min = -1.0;
    xw_max = 1.0;
    yw_min = -1.0;
    yw_max = 1.0;
    z_near = -1.0;
    z_far = -20.0;
  
    xw_min2 = -5.0;
    xw_max2 = 5.0;
    yw_min2 = -5.0;
    yw_max2 = 5.0;
    z_near2 = -1.0;
    z_far2 = -20.0;
  
    gl.uniform3fv(viewPositionLocation, new Float32Array(P0));
    gl.uniformMatrix4fv(viewMatrixUniformLocation, false, viewingMatrix);
  
    let projectionMatrix = m4.identity();
    projectionMatrix = perspectiveProjection(xw_min, xw_max, yw_min, yw_max, z_near, z_far);
    gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);
  
    const bodyElement = document.querySelector("body");
    bodyElement.addEventListener("keydown", keyDown, false);
    bodyElement.addEventListener("keyup", keyUp, false);
    document.querySelector("#reload").addEventListener("click", reload);
    document.querySelector("#coelho").addEventListener("click", coelho);
  
    const CAMERA_HEIGHT_MIN = 1.0; 
    const CAMERA_HEIGHT_MAX = 5.0;
    const CAMERA_RADIUS_MIN = 3.0; 
    const CAMERA_RADIUS_MAX = 8.0;
    let camera_ang = 0;
    let camera_raio = 4.0;
    let camera_alt = 0.0; 
    let thetaX = 0.0;
    let thetaY = 0.0;
    let thetaZ = 0.0;
    let ty_player1 = 0.01;
    let ty_player2 = -0.01;
    let tx_ball= 0;
    let ty_ball= 0;
    let tx_co = -3;
    let ty_co = -3;
    let vel = 0.1;
    let vel_co = Math.random()*0.2;
    let vel_co_y = Math.random()*0.2;
    let p1 = 0;
    let p2 = 0;
    let wait = 200;
    let pass = 0;
    //angulo maior do que 45 graus
    let ballX = Math.random() * 2 -1
    while ( Math.abs(ballX) < 0.5) {
        ballX = Math.random() * 2 -1
    } 
    let ballY = Math.random() * (Math.abs(ballX) * 2) -Math.abs(ballX) 
    let vel_ball = 0.06/((Math.abs(ballX)+Math.abs(ballY))**(0.8))
    console.log(ballX, ballY)
  
    function keyDown(event) {
        console.log(event, event.key)
        switch (event.key) {
            case "1":
              let orthographicMatrix = ortographicProjection(xw_min2,xw_max2,yw_min2,yw_max2,z_near2,z_far2);
              gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, orthographicMatrix);
              break;
            case "2":
              projectionMatrix = perspectiveProjection(xw_min, xw_max, yw_min, yw_max, z_near, z_far);
              gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);
              break;
            case "w":
                p1 = 1;
                break;
            case "s":
                p1 = -1
                break;
            case "ArrowUp":
                p2 = 1;
                break;
            case "ArrowDown":
                p2 = -1;
                break;
            case "a":
                camera_ang -= 0.1;
                break;
            case "h":
                camera_ang += 0.1;
                break;
            case "u":
                camera_alt = Math.min(CAMERA_HEIGHT_MAX, camera_alt + 0.1);
                break;
            case "d":
                camera_alt = Math.max(CAMERA_HEIGHT_MIN, camera_alt - 0.1);
                break;
            case "c":
                camera_raio = Math.max(CAMERA_RADIUS_MIN, camera_raio - 0.1);
                break;
            case "f":
                camera_raio = Math.min(CAMERA_RADIUS_MAX, camera_raio + 0.1);
                break;        
        }
    }
  
    function keyUp(event) {
        console.log(event, event.key)
        switch (event.key) {
            case "w":
                p1 = 0;
                break;
            case "s":
                p1 = 0;
                break;
            case "ArrowUp":
                p2 = 0;
                break;
            case "ArrowDown":
                p2 = 0;
                break;
            case "a":
                  break;
            case  "h":
                  break;
        }
    }
  
    function reload(){
        pontuacao_1 = 0;
        pontuacao_2 = 0;
        ty_player1 = 0;
        ty_player2 = 0;
        camera_ang = 0;
        camera_alt = 0.0
        camera_raio = 4.0;
        wait = 500;
        document.getElementById("p2").innerHTML = pontuacao_2;
        document.getElementById("p1").innerHTML = pontuacao_1;
        pass = 0;
        coelho_trapalhao = 0
        document.getElementById("coelho").style.backgroundColor = 'rgb(220, 139, 255)';
    }
  
    function coelho(){
      coelho_trapalhao = !coelho_trapalhao
      if (coelho_trapalhao){
          document.getElementById("coelho").style.backgroundColor = 'rgb(101, 55, 121)';
      } else {
          document.getElementById("coelho").style.backgroundColor = 'rgb(220, 139, 255)';
      }
    }
  
  
    function drawElements() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
        thetaZ += Math.PI / 4;
        thetaY += Math.PI / 4;
        thetaX += Math.PI / 4;
  
        P0 = [Math.sin(camera_ang) * camera_raio, camera_alt, Math.cos(camera_ang) * camera_raio];
        
        P_ref = [0.0, 0.0, 0.0];
        V = [0.0, 1.0, 0.0];
      
        viewingMatrix = set3dViewingMatrix(P0, P_ref, V);
        gl.uniformMatrix4fv(viewMatrixUniformLocation, false, viewingMatrix);
        gl.uniform3fv(viewPositionLocation, new Float32Array(P0));
  
        //p1 - barra esquerda
        if((ty_player1 > 2) && p1 == 1) {
            p1 = 0;
        } else if((ty_player1 < -2.1) && p1 == -1){
            p1 = 0;
        }
        ty_player1 += vel * p1
        let color = [0.82,0.609,0.96];
        gl.uniform3fv(ambientReflectionLocation, new Float32Array(color));
        gl.uniform3fv(diffuseReflectionLocation, new Float32Array(color));
        gl.uniform3fv(specularReflectionLocation, new Float32Array([1.0, 1.0, 1.0]));
        vertexData = setSuperConicSphereVertices(0.8, 10, 10, 0.2, 0.2);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
        normalData = setSuperConicSphereNormals_flat(0.8, 10, 10, 0.2, 0.2);
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
        let modelMatrix = m4.identity();
        modelMatrix = m4.translate(modelMatrix, -2.85, ty_player1, 0.0);
        modelMatrix = m4.scale(modelMatrix, 0.1, 1.2, 0.1);
        gl.uniformMatrix4fv(modelMatrixUniformLocation, false, modelMatrix);
        var inverseTransposeModelMatrix = m4.transpose(m4.inverse(modelMatrix));
        gl.uniformMatrix4fv(inverseTransposeModelMatrixUniformLocation, false, inverseTransposeModelMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
  
  
        //p2 - barra direita
        if((ty_player2 > 2) && p2 == 1) {
            p2 = 0;
        } else if((ty_player2 < -2.1) && p2 == -1){
            p2 = 0;
        }
        ty_player2 += vel * p2
        color =  [0.82,0.609,0.96];
        gl.uniform3fv(ambientReflectionLocation, new Float32Array(color));
        gl.uniform3fv(diffuseReflectionLocation, new Float32Array(color));
        gl.uniform3fv(specularReflectionLocation, new Float32Array([1.0, 1.0, 1.0]));
        vertexData = setSuperConicSphereVertices(0.8, 10, 10, 0.2, 0.2);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
        normalData = setSuperConicSphereNormals_flat(0.8, 10, 10, 0.2, 0.2);
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
        modelMatrix = m4.identity();
        modelMatrix = m4.translate(modelMatrix, +2.85, ty_player2, 0.0);
        modelMatrix = m4.scale(modelMatrix, 0.1, 1.2, 0.1);
        gl.uniformMatrix4fv(modelMatrixUniformLocation, false, modelMatrix);
        var inverseTransposeModelMatrix = m4.transpose(m4.inverse(modelMatrix));
        gl.uniformMatrix4fv(inverseTransposeModelMatrixUniformLocation, false, inverseTransposeModelMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
  
  
        //pong_ball
        if(tx_ball==0){
            var start = new Date().getTime();
            var end = start;
            while(end < start + wait) {
                end = new Date().getTime();
            }
            wait = 200;
        }
        if(tx_ball>3.5 || tx_ball<-3.5){
            if(tx_ball>3.5){
                pontuacao_1 +=1;
                document.getElementById("p1").innerHTML = pontuacao_1;
            } else { 
                pontuacao_2 += 1; 
                document.getElementById("p2").innerHTML = pontuacao_2;
            }
            tx_ball = 0;
            ty_ball = 0;
            ballX = Math.random() * 2 -1
            while ( Math.abs(ballX) < 0.4) {
                ballX = Math.random() * 2 -1
            }
            ballY = Math.random() * (Math.abs(ballX) * 2) -Math.abs(ballX) 
            vel_ball = 0.06/((Math.abs(ballX)+Math.abs(ballY))**(0.8))
        } else{
            if (tx_ball <= -2.5) {
              if (ty_ball >= ty_player1 - 1.1 && ty_ball <= ty_player1 + 1.1) {
                ballX = Math.abs(ballX)            
              
                vel_ball *= 1.05;
              }
            }
      
            if (tx_ball >= 2.5) {
              if (ty_ball >= ty_player2 - 1.1 && ty_ball <= ty_player2 + 1.1) {
                ballX = -Math.abs(ballX);
  
                vel_ball *= 1.05;
              }
            }
  
            if (ty_ball > 2.8 || ty_ball < -2.8) {
              ballY = -ballY;
            }
            tx_ball += ballX * vel_ball;
            ty_ball += ballY * vel_ball;
        }
        if(pass == 0){
            tx_ball = 0;
            ty_ball = 0;
        }
        pass = 1;
        color = [0.5,0.3,1];
        gl.uniform3fv(ambientReflectionLocation, new Float32Array(color));
        gl.uniform3fv(diffuseReflectionLocation, new Float32Array([0.7, 0.7, 0.7])); 
        gl.uniform3fv(specularReflectionLocation, new Float32Array([0.9, 0.9, 0.9]))
        gl.uniform1f(shininessLocation, 200.0);
        //fonte de luz móvel
        gl.uniform3fv(lightPositionLocation, new Float32Array([tx_ball, ty_ball, 1.0]));
        
        vertexData = setSuperConicSphereVertices(1, 50, 50, 1, 1);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
        normalData = setSuperConicSphereNormals_flat(1.0, 50, 50, 1, 1);
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
        modelMatrix = m4.identity();
        modelMatrix = m4.translate(modelMatrix, tx_ball, ty_ball, 0.0);
        modelMatrix = m4.scale(modelMatrix, 0.2, 0.2, 0.05);
        modelMatrix = m4.xRotate(modelMatrix, degToRad(thetaX));
        modelMatrix = m4.yRotate(modelMatrix, degToRad(thetaY));
        modelMatrix = m4.zRotate(modelMatrix, degToRad(thetaZ));
        gl.uniformMatrix4fv(modelMatrixUniformLocation, false, modelMatrix);
        var inverseTransposeModelMatrix = m4.transpose(m4.inverse(modelMatrix));
        gl.uniformMatrix4fv(inverseTransposeModelMatrixUniformLocation, false, inverseTransposeModelMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
  
  
  
        //coelho
        if(coelho_trapalhao){
          if(tx_co>5){
              vel_co = -Math.random()*0.2
          } else if (tx_co<-4.5)(
              vel_co = Math.random()*0.2
          )
  
          if(ty_co>5){
              vel_co_y = -Math.random()*0.2
          } else if (ty_co<-4.5)(
              vel_co_y = Math.random()*0.2
          )
  
          tx_co += vel_co
          ty_co += vel_co_y
          color = [1,1,1];
          gl.uniform3fv(ambientReflectionLocation, new Float32Array(color));
          gl.uniform3fv(diffuseReflectionLocation, new Float32Array(color)); 
          gl.uniform3fv(specularReflectionLocation, new Float32Array([0.9, 0.9, 0.9]))
          vertexData = setSuperConicSphereVertices(1, 15, 10, 1, 1);
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
          normalData = setSuperConicSphereNormals_flat(1.0, 15, 10, 1, 1);
          gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
          modelMatrix = m4.identity();
          modelMatrix = m4.translate(modelMatrix, tx_co -0.2, ty_co-0.3, 0.0);
          modelMatrix = m4.scale(modelMatrix, 0.4, 0.3, 0.05);
          gl.uniformMatrix4fv(modelMatrixUniformLocation, false, modelMatrix);
          var inverseTransposeModelMatrix = m4.transpose(m4.inverse(modelMatrix));
          gl.uniformMatrix4fv(inverseTransposeModelMatrixUniformLocation, false, inverseTransposeModelMatrix);
          gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
          
          
          //orelhas
          vertexData = setSuperConicSphereVertices(1, 20, 20, 1, 1);
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
          normalData = setSuperConicSphereNormals_flat(1.0, 20, 20, 1, 1);
          gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
          modelMatrix = m4.identity();
          modelMatrix = m4.translate(modelMatrix, tx_co-0.1, ty_co+0.3, 0.0);
          modelMatrix = m4.scale(modelMatrix, 0.08, 0.2, 0.05);
          gl.uniformMatrix4fv(modelMatrixUniformLocation, false, modelMatrix);
          var inverseTransposeModelMatrix = m4.transpose(m4.inverse(modelMatrix));
          gl.uniformMatrix4fv(inverseTransposeModelMatrixUniformLocation, false, inverseTransposeModelMatrix);
          gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
          gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
          modelMatrix = m4.identity();
          modelMatrix = m4.translate(modelMatrix, tx_co+0.1, ty_co+0.3, 0.0);
          modelMatrix = m4.scale(modelMatrix, 0.08, 0.2, 0.05);
          gl.uniformMatrix4fv(modelMatrixUniformLocation, false, modelMatrix);
          var inverseTransposeModelMatrix = m4.transpose(m4.inverse(modelMatrix));
          gl.uniformMatrix4fv(inverseTransposeModelMatrixUniformLocation, false, inverseTransposeModelMatrix);
          gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
  
          vertexData = setSuperConicSphereVertices(1, 20, 20, 1, 1);
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
          normalData = setSuperConicSphereNormals_flat(1.0, 20, 20, 1, 1);
          gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
          modelMatrix = m4.identity();
          modelMatrix = m4.translate(modelMatrix, tx_co, ty_co, 0.0);
          modelMatrix = m4.scale(modelMatrix, 0.2, 0.2, 0.05);
          gl.uniformMatrix4fv(modelMatrixUniformLocation, false, modelMatrix);
          var inverseTransposeModelMatrix = m4.transpose(m4.inverse(modelMatrix));
          gl.uniformMatrix4fv(inverseTransposeModelMatrixUniformLocation, false, inverseTransposeModelMatrix);
          gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
  
        }
        else {
          tx_co = -3
          ty_co = -3
        }
        
        requestAnimationFrame(drawElements);
    }
  
    drawElements();
    
}
  
function set3dViewingMatrix(P0, P_ref, V) {
let matrix = [];
let N = [
    P0[0] - P_ref[0],
    P0[1] - P_ref[1],
    P0[2] - P_ref[2],
];
let n = unitVector(N);
let u = unitVector(crossProduct(V, n));
let v = crossProduct(n, u);

let T = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    -P0[0], -P0[1], -P0[2], 1,
];
let R = [
    u[0], v[0], n[0], 0,
    u[1], v[1], n[1], 0,
    u[2], v[2], n[2], 0,
    0, 0, 0, 1,
];

matrix = m4.multiply(R, T);
return matrix;
}

function createShader(gl, type, source) {
var shader = gl.createShader(type);
gl.shaderSource(shader, source);
gl.compileShader(shader);
var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
if (success) {
    return shader;
}

console.log(gl.getShaderInfoLog(shader));
gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
var success = gl.getProgramParameter(program, gl.LINK_STATUS);
if (success) {
    return program;
}

console.log(gl.getProgramInfoLog(program));
gl.deleteProgram(program);
}

function setSuperConicSphereVertices(radius, slices, stacks, s1, s2) {
const vertexData = [];
let slicesStep = (2 * Math.PI) / slices;
let stacksStep = Math.PI / stacks;

for (let i = 0; i < stacks; i++) {
    let phi = -Math.PI / 2 + i * stacksStep;
    for (let j = 0; j < slices; j++) {
        let theta = -Math.PI + j * slicesStep;
        vertexData.push(...[
            radius * Math.sign(Math.cos(phi)) * Math.pow(Math.abs(Math.cos(phi)), s1) * Math.sign(Math.cos(theta)) * Math.pow(Math.abs(Math.cos(theta)), s2),
            radius * Math.sign(Math.cos(phi)) * Math.pow(Math.abs(Math.cos(phi)), s1) * Math.sign(Math.sin(theta)) * Math.pow(Math.abs(Math.sin(theta)), s2),
            radius * Math.sign(Math.sin(phi)) * Math.pow(Math.abs(Math.sin(phi)), s1)
        ]);
        vertexData.push(...[
            radius * Math.sign(Math.cos(phi + stacksStep)) * Math.pow(Math.abs(Math.cos(phi + stacksStep)), s1) * Math.sign(Math.cos(theta)) * Math.pow(Math.abs(Math.cos(theta)), s2),
            radius * Math.sign(Math.cos(phi + stacksStep)) * Math.pow(Math.abs(Math.cos(phi + stacksStep)), s1) * Math.sign(Math.sin(theta)) * Math.pow(Math.abs(Math.sin(theta)), s2),
            radius * Math.sign(Math.sin(phi + stacksStep)) * Math.pow(Math.abs(Math.sin(phi + stacksStep)), s1)
        ]);
        vertexData.push(...[
            radius * Math.sign(Math.cos(phi)) * Math.pow(Math.abs(Math.cos(phi)), s1) * Math.sign(Math.cos(theta + slicesStep)) * Math.pow(Math.abs(Math.cos(theta + slicesStep)), s2),
            radius * Math.sign(Math.cos(phi)) * Math.pow(Math.abs(Math.cos(phi)), s1) * Math.sign(Math.sin(theta + slicesStep)) * Math.pow(Math.abs(Math.sin(theta + slicesStep)), s2),
            radius * Math.sign(Math.sin(phi)) * Math.pow(Math.abs(Math.sin(phi)), s1)
        ]);
        vertexData.push(...[
            radius * Math.sign(Math.cos(phi + stacksStep)) * Math.pow(Math.abs(Math.cos(phi + stacksStep)), s1) * Math.sign(Math.cos(theta)) * Math.pow(Math.abs(Math.cos(theta)), s2),
            radius * Math.sign(Math.cos(phi + stacksStep)) * Math.pow(Math.abs(Math.cos(phi + stacksStep)), s1) * Math.sign(Math.sin(theta)) * Math.pow(Math.abs(Math.sin(theta)), s2),
            radius * Math.sign(Math.sin(phi + stacksStep)) * Math.pow(Math.abs(Math.sin(phi + stacksStep)), s1)
        ]);
        vertexData.push(...[
            radius * Math.sign(Math.cos(phi + stacksStep)) * Math.pow(Math.abs(Math.cos(phi + stacksStep)), s1) * Math.sign(Math.cos(theta + slicesStep)) * Math.pow(Math.abs(Math.cos(theta + slicesStep)), s2),
            radius * Math.sign(Math.cos(phi + stacksStep)) * Math.pow(Math.abs(Math.cos(phi + stacksStep)), s1) * Math.sign(Math.sin(theta + slicesStep)) * Math.pow(Math.abs(Math.sin(theta + slicesStep)), s2),
            radius * Math.sign(Math.sin(phi + stacksStep)) * Math.pow(Math.abs(Math.sin(phi + stacksStep)), s1)
        ]);
        vertexData.push(...[
            radius * Math.sign(Math.cos(phi)) * Math.pow(Math.abs(Math.cos(phi)), s1) * Math.sign(Math.cos(theta + slicesStep)) * Math.pow(Math.abs(Math.cos(theta + slicesStep)), s2),
            radius * Math.sign(Math.cos(phi)) * Math.pow(Math.abs(Math.cos(phi)), s1) * Math.sign(Math.sin(theta + slicesStep)) * Math.pow(Math.abs(Math.sin(theta + slicesStep)), s2),
            radius * Math.sign(Math.sin(phi)) * Math.pow(Math.abs(Math.sin(phi)), s1)
        ]);
    }
}

return vertexData;
}

function setSuperConicSphereNormals_flat(radius, slices, stacks, s1, s2) {
const normalData = [];
let slicesStep = (2 * Math.PI) / slices;
let stacksStep = Math.PI / stacks;

let theta = -Math.PI;
let phi = -Math.PI / 2;

for (let i = 0; i < stacks; i++) {
    let phi = -Math.PI / 2 + i * stacksStep;
    for (let j = 0; j < slices; j++) {
        let theta = -Math.PI + j * slicesStep;
        P0 = [
            radius * Math.sign(Math.cos(phi)) * Math.pow(Math.abs(Math.cos(phi)), s1) * Math.sign(Math.cos(theta)) * Math.pow(Math.abs(Math.cos(theta)), s2),
            radius * Math.sign(Math.cos(phi)) * Math.pow(Math.abs(Math.cos(phi)), s1) * Math.sign(Math.sin(theta)) * Math.pow(Math.abs(Math.sin(theta)), s2),
            radius * Math.sign(Math.sin(phi)) * Math.pow(Math.abs(Math.sin(phi)), s1)
        ];
        P1 = [
            radius * Math.sign(Math.cos(phi + stacksStep)) * Math.pow(Math.abs(Math.cos(phi + stacksStep)), s1) * Math.sign(Math.cos(theta)) * Math.pow(Math.abs(Math.cos(theta)), s2),
            radius * Math.sign(Math.cos(phi + stacksStep)) * Math.pow(Math.abs(Math.cos(phi + stacksStep)), s1) * Math.sign(Math.sin(theta)) * Math.pow(Math.abs(Math.sin(theta)), s2),
            radius * Math.sign(Math.sin(phi + stacksStep)) * Math.pow(Math.abs(Math.sin(phi + stacksStep)), s1)
        ];
        P2 = [
            radius * Math.sign(Math.cos(phi)) * Math.pow(Math.abs(Math.cos(phi)), s1) * Math.sign(Math.cos(theta + slicesStep)) * Math.pow(Math.abs(Math.cos(theta + slicesStep)), s2),
            radius * Math.sign(Math.cos(phi)) * Math.pow(Math.abs(Math.cos(phi)), s1) * Math.sign(Math.sin(theta + slicesStep)) * Math.pow(Math.abs(Math.sin(theta + slicesStep)), s2),
            radius * Math.sign(Math.sin(phi)) * Math.pow(Math.abs(Math.sin(phi)), s1)
        ];
        N = crossProduct([P2[0] - P0[0], P2[1] - P0[1], P2[2] - P0[2]], [P1[0] - P0[0], P1[1] - P0[1], P1[2] - P0[2]]);
        normalData.push(...N);
        normalData.push(...N);
        normalData.push(...N);

        P0 = [
            radius * Math.sign(Math.cos(phi + stacksStep)) * Math.pow(Math.abs(Math.cos(phi + stacksStep)), s1) * Math.sign(Math.cos(theta)) * Math.pow(Math.abs(Math.cos(theta)), s2),
            radius * Math.sign(Math.cos(phi + stacksStep)) * Math.pow(Math.abs(Math.cos(phi + stacksStep)), s1) * Math.sign(Math.sin(theta)) * Math.pow(Math.abs(Math.sin(theta)), s2),
            radius * Math.sign(Math.sin(phi + stacksStep)) * Math.pow(Math.abs(Math.sin(phi + stacksStep)), s1)
        ];
        P1 = [
            radius * Math.sign(Math.cos(phi + stacksStep)) * Math.pow(Math.abs(Math.cos(phi + stacksStep)), s1) * Math.sign(Math.cos(theta + slicesStep)) * Math.pow(Math.abs(Math.cos(theta + slicesStep)), s2),
            radius * Math.sign(Math.cos(phi + stacksStep)) * Math.pow(Math.abs(Math.cos(phi + stacksStep)), s1) * Math.sign(Math.sin(theta + slicesStep)) * Math.pow(Math.abs(Math.sin(theta + slicesStep)), s2),
            radius * Math.sign(Math.sin(phi + stacksStep)) * Math.pow(Math.abs(Math.sin(phi + stacksStep)), s1)
        ];
        P2 = [
            radius * Math.sign(Math.cos(phi)) * Math.pow(Math.abs(Math.cos(phi)), s1) * Math.sign(Math.cos(theta + slicesStep)) * Math.pow(Math.abs(Math.cos(theta + slicesStep)), s2),
            radius * Math.sign(Math.cos(phi)) * Math.pow(Math.abs(Math.cos(phi)), s1) * Math.sign(Math.sin(theta + slicesStep)) * Math.pow(Math.abs(Math.sin(theta + slicesStep)), s2),
            radius * Math.sign(Math.sin(phi)) * Math.pow(Math.abs(Math.sin(phi)), s1)
        ];
        N = crossProduct([P2[0] - P0[0], P2[1] - P0[1], P2[2] - P0[2]], [P1[0] - P0[0], P1[1] - P0[1], P1[2] - P0[2]]);
        normalData.push(...N);
        normalData.push(...N);
        normalData.push(...N);
    }
}

return normalData;
}

function set3dViewingMatrix(P0, P_ref, V) {
let matrix = [];
let N = [
    P0[0] - P_ref[0],
    P0[1] - P_ref[1],
    P0[2] - P_ref[2],
];
let n = unitVector(N);
let u = unitVector(crossProduct(V, n));
let v = crossProduct(n, u);

let T = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    -P0[0], -P0[1], -P0[2], 1,
];
let R = [
    u[0], v[0], n[0], 0,
    u[1], v[1], n[1], 0,
    u[2], v[2], n[2], 0,
    0, 0, 0, 1,
];

matrix = m4.multiply(R, T);
return matrix;
}

function ortographicProjection(xw_min, xw_max, yw_min, yw_max, z_near, z_far) {
let matrix = [
    2 / (xw_max - xw_min), 0, 0, 0,
    0, 2 / (yw_max - yw_min), 0, 0,
    0, 0, -2 / (z_near - z_far), 0,
    -(xw_max + xw_min) / (xw_max - xw_min), -(yw_max + yw_min) / (yw_max - yw_min), (z_near + z_far) / (z_near - z_far), 1,
];
return matrix;
}

function perspectiveProjection(xw_min, xw_max, yw_min, yw_max, z_near, z_far) {
let matrix = [
    -(2 * z_near) / (xw_max - xw_min), 0, 0, 0,
    0, -(2 * z_near) / (yw_max - yw_min), 0, 0,
    (xw_max + xw_min) / (xw_max - xw_min), (yw_max + yw_min) / (yw_max - yw_min), (z_near + z_far) / (z_near - z_far), -1,
    0, 0, -1, 0,
];
return matrix;
}

var m4 = {
identity: function () {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
},

normalize: function (v, dst) {
    dst = dst || new MatType(3);
    var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    // make sure we don't divide by 0.
    if (length > 0.00001) {
        dst[0] = v[0] / length;
        dst[1] = v[1] / length;
        dst[2] = v[2] / length;
    }
    return dst;
},

multiply: function (a, b) {
    var a00 = a[0 * 4 + 0];
    var a01 = a[0 * 4 + 1];
    var a02 = a[0 * 4 + 2];
    var a03 = a[0 * 4 + 3];
    var a10 = a[1 * 4 + 0];
    var a11 = a[1 * 4 + 1];
    var a12 = a[1 * 4 + 2];
    var a13 = a[1 * 4 + 3];
    var a20 = a[2 * 4 + 0];
    var a21 = a[2 * 4 + 1];
    var a22 = a[2 * 4 + 2];
    var a23 = a[2 * 4 + 3];
    var a30 = a[3 * 4 + 0];
    var a31 = a[3 * 4 + 1];
    var a32 = a[3 * 4 + 2];
    var a33 = a[3 * 4 + 3];
    var b00 = b[0 * 4 + 0];
    var b01 = b[0 * 4 + 1];
    var b02 = b[0 * 4 + 2];
    var b03 = b[0 * 4 + 3];
    var b10 = b[1 * 4 + 0];
    var b11 = b[1 * 4 + 1];
    var b12 = b[1 * 4 + 2];
    var b13 = b[1 * 4 + 3];
    var b20 = b[2 * 4 + 0];
    var b21 = b[2 * 4 + 1];
    var b22 = b[2 * 4 + 2];
    var b23 = b[2 * 4 + 3];
    var b30 = b[3 * 4 + 0];
    var b31 = b[3 * 4 + 1];
    var b32 = b[3 * 4 + 2];
    var b33 = b[3 * 4 + 3];
    return [
        b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
        b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
        b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
        b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
        b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
        b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
        b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
        b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
        b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
        b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
        b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
        b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
        b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
        b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
        b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
        b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
},

transpose: function (m, dst) {
    dst = dst || new Float32Array(16);

    dst[0] = m[0];
    dst[1] = m[4];
    dst[2] = m[8];
    dst[3] = m[12];
    dst[4] = m[1];
    dst[5] = m[5];
    dst[6] = m[9];
    dst[7] = m[13];
    dst[8] = m[2];
    dst[9] = m[6];
    dst[10] = m[10];
    dst[11] = m[14];
    dst[12] = m[3];
    dst[13] = m[7];
    dst[14] = m[11];
    dst[15] = m[15];

    return dst;
},

inverse: function (m, dst) {
    dst = dst || new Float32Array(16);
    var m00 = m[0 * 4 + 0];
    var m01 = m[0 * 4 + 1];
    var m02 = m[0 * 4 + 2];
    var m03 = m[0 * 4 + 3];
    var m10 = m[1 * 4 + 0];
    var m11 = m[1 * 4 + 1];
    var m12 = m[1 * 4 + 2];
    var m13 = m[1 * 4 + 3];
    var m20 = m[2 * 4 + 0];
    var m21 = m[2 * 4 + 1];
    var m22 = m[2 * 4 + 2];
    var m23 = m[2 * 4 + 3];
    var m30 = m[3 * 4 + 0];
    var m31 = m[3 * 4 + 1];
    var m32 = m[3 * 4 + 2];
    var m33 = m[3 * 4 + 3];
    var tmp_0 = m22 * m33;
    var tmp_1 = m32 * m23;
    var tmp_2 = m12 * m33;
    var tmp_3 = m32 * m13;
    var tmp_4 = m12 * m23;
    var tmp_5 = m22 * m13;
    var tmp_6 = m02 * m33;
    var tmp_7 = m32 * m03;
    var tmp_8 = m02 * m23;
    var tmp_9 = m22 * m03;
    var tmp_10 = m02 * m13;
    var tmp_11 = m12 * m03;
    var tmp_12 = m20 * m31;
    var tmp_13 = m30 * m21;
    var tmp_14 = m10 * m31;
    var tmp_15 = m30 * m11;
    var tmp_16 = m10 * m21;
    var tmp_17 = m20 * m11;
    var tmp_18 = m00 * m31;
    var tmp_19 = m30 * m01;
    var tmp_20 = m00 * m21;
    var tmp_21 = m20 * m01;
    var tmp_22 = m00 * m11;
    var tmp_23 = m10 * m01;

    var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
        (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
    var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
        (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
    var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
        (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
    var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
        (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

    var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    dst[0] = d * t0;
    dst[1] = d * t1;
    dst[2] = d * t2;
    dst[3] = d * t3;
    dst[4] = d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
        (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30));
    dst[5] = d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
        (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30));
    dst[6] = d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
        (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30));
    dst[7] = d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
        (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20));
    dst[8] = d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
        (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33));
    dst[9] = d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
        (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33));
    dst[10] = d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
        (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33));
    dst[11] = d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
        (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23));
    dst[12] = d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
        (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22));
    dst[13] = d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
        (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02));
    dst[14] = d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
        (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12));
    dst[15] = d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
        (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02));

    return dst;
},

translation: function (tx, ty, tz) {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        tx, ty, tz, 1,
    ];
},

xRotation: function (angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1,
    ];
},

yRotation: function (angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1,
    ];
},

zRotation: function (angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
        c, s, 0, 0,
        -s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ];
},

scaling: function (sx, sy, sz) {
    return [
        sx, 0, 0, 0,
        0, sy, 0, 0,
        0, 0, sz, 0,
        0, 0, 0, 1,
    ];
},

translate: function (m, tx, ty, tz) {
    return m4.multiply(m, m4.translation(tx, ty, tz));
},

xRotate: function (m, angleInRadians) {
    return m4.multiply(m, m4.xRotation(angleInRadians));
},

yRotate: function (m, angleInRadians) {
    return m4.multiply(m, m4.yRotation(angleInRadians));
},

zRotate: function (m, angleInRadians) {
    return m4.multiply(m, m4.zRotation(angleInRadians));
},

scale: function (m, sx, sy, sz) {
    return m4.multiply(m, m4.scaling(sx, sy, sz));
},

};

function crossProduct(v1, v2) {
let result = [
    v1[1] * v2[2] - v1[2] * v2[1],
    v1[2] * v2[0] - v1[0] * v2[2],
    v1[0] * v2[1] - v1[1] * v2[0]
];
return result;
}

function unitVector(v) {
let result = [];
let vModulus = vectorModulus(v);
return v.map(function (x) { return x / vModulus; });
}

function vectorModulus(v) {
return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2) + Math.pow(v[2], 2));
}

function radToDeg(r) {
return r * 180 / Math.PI;
}

function degToRad(d) {
return d * Math.PI / 180;
}

formas();
