OF_GLSL_SHADER_HEADER

#ifdef GL_ES
precision highp float;
#endif

uniform float qq; // unuused

uniform float osc0_feedback_filter;

uniform sampler2D tex0;

uniform sampler2D cam1;

uniform sampler2D osc1_mod;

uniform float osc0_r_offset;
uniform float osc0_g_offset;
uniform float osc0_b_offset;
uniform float osc0_powmod;

uniform float osc0_rm;
uniform float osc0_pm;
uniform float osc0_rate;
uniform float osc0_frequency;
uniform float osc0_amp;
uniform float osc0_angle;

uniform int osc0_shape;

uniform float osc0_m_rm;
uniform float osc0_m_pm;
uniform float osc0_m_rate;
uniform float osc0_m_frequency;
uniform float osc0_m_amp;
uniform float osc0_m_angle;

uniform int osc0_m_shape;

uniform float width;
uniform float height; // unuused

uniform float pm_weight; // unuused

uniform float osc0_spiral;
uniform float osc0_rotate;
uniform float osc0_modulation_rotate;

uniform float osc0_m_spiral;
uniform float osc0_m_rotate;
uniform float osc0_m_modulation_rotate;

uniform float osc0_cam1_pm;

uniform int osc0_overflow_switch;

uniform float osc0_cutoff;

uniform float osc0_m_cam1_pm;

uniform float osc0_width;
uniform float osc0_pwm;
uniform float osc0_m_width;
uniform float osc0_m_pwm;

// lets make everything from 0-1 here for now
float oscillate(float theta, int shape, float width) {
    float osc = 0.0;

    if (shape == 0) {
        osc = (sin(theta) + 1.0) * .5;
        osc = clamp(osc + width, 0.0, 1.0);
    }

    // squarewave …can add a dc offset for pwm too?
    if (shape == 1) {
        osc = sign(sin(theta) + width);
    }

    // haha tanwave
    // osc=tan(theta);

    // sawtooth??
    if (shape == 2) {
        osc = fract(theta / 6.18);
        osc = clamp(osc + width, 0.0, 1.0);
    }

    return osc;

}

vec2 rotate(vec2 coord, float theta) {
    vec2 center_coord = vec2(coord.x - .5, coord.y - .5);
    vec2 rotate_coord = vec2(0.0, 0.0);
    float spiral = abs(coord.x + coord.y) / 2.0 * width;
    coord.x = spiral + coord.x;
    coord.y = spiral + coord.y;
    rotate_coord.x = center_coord.x * cos(theta) - center_coord.y * sin(theta);
    rotate_coord.y = center_coord.x * sin(theta) + center_coord.y * cos(theta);

    rotate_coord = rotate_coord + vec2(.5, .5);

    return rotate_coord;

} // endrotate

vec3 rgb2hsb(in vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsb2rgb(in vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec2 resolution = vec2(width, height);
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);

    // new coordinate tests
    vec2 newCoordVarying = uv - vec2(.5, .5);

    // vec4 osc_mod_1=texture2D(osc1_mod,uv);

    vec4 osc_mod_1 = texture2D(tex0, uv + vec2(.0025, .0025));

    vec4 cam1_color = texture2D(cam1, fract(uv + vec2(.005, .005)));

    float om1_bright = .299 * osc_mod_1.r + .587 * osc_mod_1.g + .114 * osc_mod_1.b;
    /*
    vec2 axis=rotate(uv, osc0_angle);
    
    float osc0_arg=osc0_rate+axis.x*(osc0_frequency+osc0_pm*om1_bright);

    color.rgb=(osc0_amp+osc0_rm*om1_bright)*vec3(oscillate(osc0_arg+,0,0));
    */

    vec2 m_axis = vec2(0.0, 0.0);

    // old spiral thing
    // float osc0_spiral_new=osc0_spiral*distance(uv, vec2(.5,.5));

    // trying a new techniqe for spiral thing try adjusting the .5 .5 part?
    float osc0_spiral_new = 2.0 * osc0_spiral * distance(newCoordVarying, vec2(.0, .0));

    float osc0_m_spiral_new = osc0_m_spiral * distance(uv, vec2(.5, .5));

    vec2 axis = osc0_spiral_new + rotate(uv, osc0_angle + osc0_rotate + osc0_modulation_rotate * oscillate(osc0_m_cam1_pm * cam1_color.g + osc0_m_rate +
        osc0_m_spiral_new + (rotate(uv, osc0_m_angle + osc0_m_rotate + osc0_m_modulation_rotate * oscillate(osc0_rate + rotate(uv, osc0_angle).x * (osc0_frequency), osc0_shape, osc0_width)).x + .01) * (osc0_m_frequency + .1 * osc0_m_pm * oscillate(osc0_rate + rotate(uv, osc0_angle + osc0_spiral_new + osc0_rotate).x * (osc0_frequency) +
        osc0_m_cam1_pm * cam1_color.g, osc0_shape, osc0_width)), osc0_m_shape, osc0_m_width));

    // +rotate(uv, osc0_m_angle+osc0_m_spiral*distance(uv, vec(.5,.5))+osc0_m_rotate+osc0_m_modulation_rotate*oscillate(osc0_rate+rotate(uv, osc0_angle).x*(osc0_frequency),osc0_shape,0)).x*(osc0_m_frequency),osc0_m_shape,0));

    m_axis = osc0_m_spiral_new + rotate(uv, osc0_m_angle + osc0_m_rotate + osc0_m_modulation_rotate * oscillate(osc0_rate + rotate(uv, osc0_angle + osc0_spiral_new + osc0_rotate).x * (osc0_frequency) +
        osc0_m_cam1_pm * cam1_color.g, osc0_shape, osc0_width));

    // float osc0_m_arg=osc0_m_rate+(m_axis.x+.01)*(osc0_m_frequency+.1*osc0_m_pm*om1_bright);

    // trying something new with osc0_m pm
    float osc0_m_arg = osc0_m_rate + (m_axis.x + .01) * (osc0_m_frequency);

    float osc0_m = osc0_m_amp * oscillate(osc0_m_arg + osc0_m_cam1_pm * cam1_color.g, osc0_m_shape, osc0_m_width);

    // try out this new filter thing

    float clampit = clamp(om1_bright - osc0_cutoff, 0.0, 1.0);

    float filtered = om1_bright * (1.0 - clampit) + .5 * clampit;

    // filtered = om1_bright;

    float osc0_arg = osc0_rate + axis.x * (osc0_frequency + osc0_m_pm * osc0_m + osc0_pm * filtered);

    float filtered_rm = om1_bright * om1_bright;

    color.rgb = (osc0_amp + osc0_rm * filtered_rm + osc0_m_rm * osc0_m) * vec3(oscillate(osc0_arg + cam1_color.g * osc0_cam1_pm, osc0_shape, osc0_width + osc0_pwm * om1_bright + osc0_m_pwm * osc0_m));

    if (osc0_overflow_switch == 1) {
        // color.rgb=2.0*fract(color.rgb*.5);

        color.rgb = fract(color.rgb);
    }

    if (osc0_overflow_switch == 2) {
        if (color.r > 1.0) {
            color.rgb = vec3((1.0 - fract(color.r)));
        }
    }

    if (osc0_overflow_switch == 3) {
        if (color.r > 1.0) {
            color.rgb = vec3(fract(color.r - tan(color.r * .25 + osc0_arg)));
        }
    }

	//old color mode
	/*
	color.r=color.r+osc0_r_offset;
	color.g=color.g+osc0_g_offset;
	color.b=color.b+osc0_b_offset;
	
	if(osc0_shape==1){
		color.rgb=clamp(color.rgb,vec3(0.0),vec3(1.0));
	}
	*/

	//3 band colorizer

    vec3 colorHsb = rgb2hsb(color.rgb);

    float bright = colorHsb.z;

	// maybe try some adjusted brightness curves
    bright = pow(bright, 2.0);

	// colorize
    vec3 colorHsbBand1 = vec3(osc0_r_offset, osc0_powmod, colorHsb.z);
    vec3 colorHsbBand2 = vec3(osc0_g_offset, osc0_powmod, colorHsb.z);
    vec3 colorHsbBand3 = vec3(osc0_b_offset, osc0_powmod, colorHsb.z);

	// convert back to rgb for soft keying
    vec4 colorRgbBand1 = vec4(hsb2rgb(colorHsbBand1), 1.0);
    vec4 colorRgbBand2 = vec4(hsb2rgb(colorHsbBand2), 1.0);
    vec4 colorRgbBand3 = vec4(hsb2rgb(colorHsbBand3), 1.0);

    if (bright < .5) {
        color = mix(colorRgbBand1, colorRgbBand2, bright * 2.0);
    }

    if (bright > .5) {
        color = mix(colorRgbBand2, colorRgbBand3, (bright - .5) * 2.0);
    }
	// color.rgb=hsb2rgb(colorHsb);	

	// color.rgb=pow(color.rgb,vec3(1.0+osc0_powmod));

    vec3 cam1_color_hsb = rgb2hsb(cam1_color.rgb);
    cam1_color_hsb.z = cam1_color_hsb.z * (1.0 + .25 * osc0_feedback_filter);
    cam1_color_hsb.y = cam1_color_hsb.y * (1.0 + .25 * osc0_feedback_filter);
    cam1_color.rgb = hsb2rgb(cam1_color_hsb);

    color.rgb = mix(color.rgb, cam1_color.rgb, osc0_feedback_filter);

    gl_FragColor = color;
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	// gl_FragColor = osc_mod_1;
}
