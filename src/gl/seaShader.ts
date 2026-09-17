/**
 * The sea. A ray from an eye 3.2 units up is refined against a sum of seven
 * wave trains, and the normal there reflects a sky with a low sun ahead and
 * to the right. Wave math is LiveLoveAmelia's; the sky is graded to this
 * site's dusk — deep navy overhead, a gold sun laying ribbons on the water.
 */
export const SEA_FRAG = `
uniform vec2 resolution;
uniform float time;
uniform float octaves;    /* wave trains summed: 7 on desktop, 5 on phones */
uniform float refines;    /* surface refinement steps: 5 on desktop, 3 on phones */

const vec3 SUN = vec3(0.30, 0.17, -0.94);

float seaHeight(vec2 p, float oct) {
  float height = 0.0;
  float amplitude = 0.19;
  float frequency = 0.38;
  vec2 direction = normalize(vec2(0.85, 0.40));
  mat2 turn = mat2(0.80, -0.60, 0.60, 0.80);
  for (int i = 0; i < 7; i++) {
    if (float(i) >= oct) break;
    float phase = dot(p, direction) * frequency + time * sqrt(frequency) * 0.80;
    height += amplitude * (sin(phase) + 0.22 * sin(phase * 2.0 + 0.7));
    direction = turn * direction;
    frequency *= 1.86;
    amplitude *= 0.49;
  }
  return height;
}

vec3 sky(vec3 ray) {
  float elevation = max(ray.y, 0.0);
  vec3 horizon = vec3(0.34, 0.30, 0.27);
  vec3 upperSky = vec3(0.025, 0.045, 0.09);
  vec3 color = mix(horizon, upperSky, pow(clamp(elevation * 1.8, 0.0, 1.0), 0.55));
  float sunAlignment = max(dot(ray, normalize(SUN)), 0.0);
  color += vec3(1.0, 0.72, 0.36) * pow(sunAlignment, 18.0) * 0.22;
  color += vec3(1.0, 0.84, 0.55) * pow(sunAlignment, 850.0) * 0.6;
  return color;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - resolution * 0.5) / resolution.y;
  vec3 camera = vec3(0.0, 3.2, 0.0);
  vec3 ray = normalize(vec3(uv.x, uv.y - 0.10, -1.5));
  vec3 color = sky(ray);

  if (ray.y < -0.001) {
    float distanceToWater = -camera.y / ray.y;
    float oct = max(octaves - floor(distanceToWater * 0.02), 3.0);
    for (int i = 0; i < 6; i++) {
      if (float(i) >= refines) break;
      vec3 point = camera + ray * distanceToWater;
      float target = (seaHeight(point.xz, oct - 2.0) - camera.y) / ray.y;
      distanceToWater = mix(distanceToWater, target, 0.65);
    }
    vec3 point = camera + ray * distanceToWater;

    float epsilon = 0.035 + distanceToWater * 0.0015;
    float h0 = seaHeight(point.xz, oct);
    float dx = seaHeight(point.xz + vec2(epsilon, 0.0), oct) - h0;
    float dz = seaHeight(point.xz + vec2(0.0, epsilon), oct) - h0;
    vec3 normal = normalize(vec3(-dx, epsilon, -dz));
    vec3 view = -ray;
    vec3 reflected = reflect(ray, normal);

    float facing = max(dot(normal, view), 0.0);
    float fresnel = 0.025 + 0.975 * pow(1.0 - facing, 5.0);

    vec3 deepWater = vec3(0.012, 0.075, 0.115);
    vec3 tealWater = vec3(0.04, 0.22, 0.26);
    float swellLight = smoothstep(-0.25, 0.30, h0);
    vec3 water = mix(deepWater, tealWater, swellLight * 0.55);
    water *= 0.82 + 0.18 * max(dot(normal, normalize(SUN)), 0.0);

    color = mix(water, sky(reflected), fresnel);

    vec3 halfway = normalize(normalize(SUN) + view);
    float specular = pow(max(dot(normal, halfway), 0.0), 180.0);
    color += vec3(1.0, 0.80, 0.45) * specular * 1.7;

    float crest = smoothstep(0.15, 0.32, h0);
    color += vec3(0.18, 0.30, 0.30) * crest * 0.08 * (1.0 - fresnel);

    float haze = 1.0 - exp(-distanceToWater * 0.008);
    vec3 horizon = sky(normalize(vec3(ray.x, 0.0, ray.z)));
    color = mix(color, horizon, haze * 0.86);

    color = mix(sky(ray), color, smoothstep(0.001, 0.012, -ray.y));
  }

  vec2 screenUV = gl_FragCoord.xy / resolution;
  float edge = length((screenUV - 0.5) * vec2(0.8, 1.0));
  color *= 1.0 - 0.18 * smoothstep(0.25, 0.72, edge);

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`;
