#include ../includes/avatar-progress/fragment.glsl;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 vPosition;
varying vec2 vUv;

uniform vec3 uColor;
uniform float uTime;
uniform sampler2D uAlphaMap;
uniform bool uUseAlphaMap;
uniform float uAlphaCutoff;
uniform float uSurfaceStrength;

#define LINE_WIDTH 0.003
#define FADE_WIDTH 0.02

void main() {
    // Preserve the VRM cutouts, including the body regions hidden by clothing.
    if (uUseAlphaMap && texture2D(uAlphaMap, vUv).a < uAlphaCutoff) discard;

    vec3 normal = normalize(vNormal);

    if(!gl_FrontFacing)
        normal *= -1.0;

    float progress = 1. - getProgress();
    // Invisible scan regions must not occlude the solid half of the transition.
    if (progress <= 0.001) discard;

    float stripes = mod((vWorldPos.y - uTime * 0.1) * 25.0, 1.0);
    stripes = pow(stripes, 3.0);

    vec3 viewDir = normalize(cameraPosition - vWorldPos);

    float fresnel = pow(1.0 - dot(viewDir, normal), 2.);
    float falloff = smoothstep(.8, 0.4, fresnel);

    float holographic = stripes * fresnel;
    holographic += fresnel;
    holographic += stripes * 0.05;
    holographic *= falloff;
    
    float dist = abs(vModelProgress - uProgress);
    float lineStrength = 1.0 - smoothstep(LINE_WIDTH - FADE_WIDTH, LINE_WIDTH + FADE_WIDTH, dist);

    holographic += lineStrength * 2.;

    if(!gl_FrontFacing)
        holographic *= 0.4;

    float surface = uSurfaceStrength * (0.75 + stripes * 0.85);
    gl_FragColor = vec4(uColor, min(max(holographic, surface) * progress, 1.0));
}
