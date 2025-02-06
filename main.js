function main() {
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

    gl.enable(gl.DEPTH_TEST);

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

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.viewport(0, 0, 500, 500);
    
}

function generateColorSet(color) {
    let colorData = [];
    for (let i = 0; i < 25; i++) {
        colorData.push(...[color[0], color[1], color[2]]);
    }
    return colorData;
}

function setColor(n, colorData) {
    let color = [colorData[n * 3], colorData[n * 3 + 1], colorData[n * 3 + 2]];
    return color;
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

main();