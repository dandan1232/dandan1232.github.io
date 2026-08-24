varying float vModelProgress;

#define MODEL_PROGRESS_MIN_Y 0.4
#define MODEL_PROGRESS_MAX_Y 3.0
#define MODEL_PROGRESS_START 0.47
#define MODEL_PROGRESS_END 0.995

float getModelProgress(vec3 position) {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    float normalizedHeight = clamp(
        (worldPosition.y - MODEL_PROGRESS_MIN_Y) / (MODEL_PROGRESS_MAX_Y - MODEL_PROGRESS_MIN_Y),
        0.0,
        1.0
    );
    return mix(MODEL_PROGRESS_START, MODEL_PROGRESS_END, normalizedHeight);
}
