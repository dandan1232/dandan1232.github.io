#include ../includes/avatar-progress/fragment.glsl;
#include ../includes/about-ambient.glsl;

uniform vec3 uColor;
uniform vec3 uHighlight;

#ifdef USE_MATCAP
uniform sampler2D uMatcap;
#endif

varying vec3 vViewNormal;
varying vec3 vViewPosition;

void main() {
    vec3 normal = normalize(vViewNormal);
    vec3 viewDirection = normalize(-vViewPosition);
    vec3 color;

#ifdef USE_MATCAP
    vec3 matcapViewDirection = normalize(vViewPosition);
    vec3 x = normalize(vec3(matcapViewDirection.z, 0.0, -matcapViewDirection.x));
    vec3 y = cross(matcapViewDirection, x);
    vec2 uv = vec2(dot(x, normal), dot(y, normal)) * 0.495 + 0.5;
    color = texture2D(uMatcap, uv).rgb * uColor;
#else
    vec3 lightDirection = normalize(vec3(-0.45, 0.8, 0.6));
    float diffuse = 0.78 + max(dot(normal, lightDirection), 0.0) * 0.22;
    float rim = pow(1.0 - max(dot(normal, viewDirection), 0.0), 3.0) * 0.14;
    color = uColor * diffuse + uHighlight * rim;
#endif

    // Complement the hologram shader's height reveal so the converted region
    // is cyan immediately instead of keeping its pink/skin material underneath.
    gl_FragColor = vec4(applyAmbient(color), getProgress());
}
