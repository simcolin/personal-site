precision highp float;

#define PI 3.1415926535897932384626433832795
#define MAX_STEPS 500
#define SURFACE_DIST 0.001

uniform sampler2D scene;
uniform vec3 light_pos;
uniform vec3 camera_pos;
uniform vec3 camera_rot;
uniform float fov_scale;
uniform float time;
uniform vec2 resolution;
uniform int max_steps;
uniform float max_travel_distance;

float deg2rad(float deg) {
    return deg * PI / 180.0;
}

mat4 rotationX(float angle) {
	return mat4(	1.0,		0,			0,			0,
			 		0, 	cos(angle),	-sin(angle),		0,
					0, 	sin(angle),	 cos(angle),		0,
					0, 			0,			  0, 		1);
}

mat4 rotationY(float angle) {
	return mat4(	cos(angle),		0,		sin(angle),	0,
			 				0,		1.0,			 0,	0,
					-sin(angle),	0,		cos(angle),	0,
							0, 		0,				0,	1);
}

mat4 rotationZ(float angle) {
	return mat4(	cos(angle),		-sin(angle),	0,	0,
			 		sin(angle),		cos(angle),		0,	0,
							0,				0,		1,	0,
							0,				0,		0,	1);
}

float remap(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float get_dist(vec3 pos) {
    vec3 sphere_pos = vec3(0, 1.5, 5);
    float sphere_radius = 1.0;
    float sphere_dist = length(pos - sphere_pos) - sphere_radius;
    return min(sphere_dist, pos.y);
}

vec3 get_normal(vec3 pos) {
    float dist = get_dist(pos);
    vec3 normal = dist - vec3(
        get_dist(pos - vec3(SURFACE_DIST, 0, 0)),
        get_dist(pos - vec3(0, SURFACE_DIST, 0)),
        get_dist(pos - vec3(0, 0, SURFACE_DIST))
    );
    return normalize(normal);
}

float ray_march(vec3 ray_origin, vec3 ray_dir) {
    float dist_traveled = 0.0;
    float average_dist = 0.0;
    int step_count = 0;
    for(int i = 0; i < MAX_STEPS; i++) {
        vec3 pos = ray_origin + ray_dir * dist_traveled;
        float dist = get_dist(pos);
        dist_traveled += dist;
        step_count = i;
        if(dist_traveled > max_travel_distance || dist < SURFACE_DIST) break;
    }
    average_dist = dist_traveled / float(step_count);
    return dist_traveled;
}

void main() {
    float aspect_ratio = resolution.x / resolution.y;
    vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) * fov_scale / resolution.y;
    vec3 ray_origin = camera_pos;
    vec4 real_ray_dir = vec4(normalize(vec3(uv.x, uv.y, 1)), 1);
    real_ray_dir = real_ray_dir * rotationX(camera_rot.x) * rotationY(camera_rot.y) * rotationZ(camera_rot.z);
    vec3 ray_dir = real_ray_dir.xyz;
    float dist = ray_march(ray_origin, ray_dir);

    vec3 color;
    if(dist >= max_travel_distance) {
        color = vec3(uv, 0.5);
    } else {
        vec3 pos = ray_origin + ray_dir * dist;
        vec3 normal = get_normal(pos);

        vec3 light_dir = normalize(light_pos - pos);
        float real_light_dist = length(light_pos - pos);
        float light_dist = ray_march(pos + normal * SURFACE_DIST * 1.1, light_dir);
        if(light_dist < real_light_dist) {
            color = vec3(0);
        } else {
            color = vec3(clamp(dot(normal, light_dir), 0.0, 1.0));
        }
    }

    // vec2 vTexCoord = (gl_FragCoord - 0.5) / resolution.xy;
    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(vTexCoord, 0.0, 1.0);
}