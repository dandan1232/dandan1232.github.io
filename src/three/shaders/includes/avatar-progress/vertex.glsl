varying float vModelProgress;

uniform float uScanMinY;
uniform float uScanMaxY;

float getModelProgress(vec3 position) {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    return clamp(
        (worldPosition.y - uScanMinY) / (uScanMaxY - uScanMinY),
        0.0,
        1.0
    );
}
