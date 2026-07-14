#include ../includes/avatar-progress/vertex.glsl;

varying vec3 vViewNormal;
varying vec3 vViewPosition;

void main() {
    #include <begin_vertex>
    #include <project_vertex>

    vec4 viewPosition = modelViewMatrix * vec4(transformed, 1.0);
    vViewPosition = viewPosition.xyz;
    vViewNormal = normalize(normalMatrix * normal);
    vModelProgress = getModelProgress(transformed);
}
