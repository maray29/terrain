uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
varying float vColorRandom;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

float PI = 3.141592653589793238;

// Function to create a circle with blurred edges
float circle(vec2 uv, float radius, float blur) {
    float dist = length(uv - vec2(0.5));
    float circle = smoothstep(radius, radius + blur, dist);
    return 1.0 - circle;
}

void main() {

    float alpha = 1. - smoothstep(0.0, 0.5, length(gl_PointCoord - vec2(0.5)));
    alpha *= 0.4;
    vec3 finalColor;

    if (vColorRandom < 0.53) {
        finalColor = uColor1;
    } else if (vColorRandom < 0.86) {
        finalColor = uColor2;
    } else {
        finalColor = uColor3;
    }

    // float gradient = smoothstep(0.4, 0.5, vUv.x);
    float gradient = circle(vUv, 0.3, 0.2);

    gl_FragColor = vec4(finalColor, alpha * gradient);
}