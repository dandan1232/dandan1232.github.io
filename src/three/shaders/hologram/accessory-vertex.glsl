#include ../includes/avatar-progress/vertex.glsl;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 vPosition;

void main() {
    #include <begin_vertex>
    #include <project_vertex>

    vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);

    vNormal = normalize(mat3(modelMatrix) * normal);
    vWorldPos = worldPosition.xyz;
    vPosition = transformed;
    vModelProgress = getModelProgress(transformed);
}
