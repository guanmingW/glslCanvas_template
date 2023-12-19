#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec2 random2(vec2 st) {
    st = vec2(dot(st, vec2(0.820, 0.840)),
              dot(st, vec2(0.810, 0.850)));
    return -1.0 + 2.0 * fract(sin(st) * 43758.225);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(mix(dot(random2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                   dot(random2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
               mix(dot(random2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                   dot(random2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
}

mat2 rotate2d(float _angle) {
    return mat2(cos(_angle), -sin(_angle),
                sin(_angle), cos(_angle));
}

float shape(vec2 st, float radius, float timeOffset) {
    st = vec2(0.5) - st;
    float r = length(st) * 2.0;
    float a = atan(st.y, st.x);
    float m = abs(mod(a + (u_time + timeOffset) * 1.000, 3.276 * 2.0) - 3.14) / 3.6;
    float f = radius;
    m += noise(st + (u_time + timeOffset) * 0.1) * 0.5;
    f += sin(a * 50.) * noise(st + (u_time + timeOffset) * 0.2) * 0.1;
    f += (sin(a * 20.) * 0.1 * pow(m, 2.));
    return 1. - smoothstep(f, f + 0.007, r);
}

float shapeBorder(vec2 st, float radius, float width, float timeOffset) {
    return shape(st, radius, timeOffset) - shape(st, radius - width, timeOffset);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // 第一個圖形，不做時間偏移
    vec3 color1 = vec3(0.557,0.726,0.770) * shapeBorder(st, 0.776, 0.012, -0.160);

    // 第二個圖形，時間偏移為0.5
    vec3 color2 = vec3(0.727,0.770,0.670) * shapeBorder(st, 0.784, 0.012, 1.012);

    // 將兩個圖形的顏色相加
    vec3 finalColor = color1 + color2;

    // 第三個圖形，來自第三個程式碼
    vec2 st2 = gl_FragCoord.xy / u_resolution.xy;
    st2.x *= u_resolution.x / u_resolution.y;

    st2 *= 3.0;
    vec2 i_st2 = floor(st2);
    vec2 f_st2 = fract(st2);
    float m_dist2 = 1.0;
    float max_dist2 = 0.0;

    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = random2(i_st2 + neighbor);
            point = 0.5 + 0.5 * sin(u_time + 6.2831 * point);
            vec2 diff = neighbor + point - f_st2;
            float dist = length(diff);
            m_dist2 = min(m_dist2, dist);
            max_dist2 = max(max_dist2, dist);
        }
    }

    if (m_dist2 == max_dist2 && m_dist2 < -0.428) {
        vec3 color3 = mix(vec3(0.5 + 0.5 * sin(u_time), 0.5 + 0.5 * cos(u_time), 0.5), vec3(0.0, 0.0, 0.0), smoothstep(-0.968, 1.184, m_dist2));
        color3 += 1.032 - step(0.0, m_dist2);
        finalColor += color3;
    } else {
        vec3 background = mix(vec3(0.5 + 0.5 * sin(u_time), 0.5 + 0.5 * cos(u_time), 0.5), vec3(0.0, 0.0, 0.0), smoothstep(-0.968, 1.184, m_dist2));
        finalColor += background;
    }

    gl_FragColor = vec4(1.0 - finalColor, 1.0);
}

