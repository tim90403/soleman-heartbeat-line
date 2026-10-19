(function () {
	'use strict';

	var TAIL_RATIO = 0.5;

	function createBeat() {
		var points = [];

		function push(x, y, corner) {
			var last = points[points.length - 1];

			if (last && Math.abs(last.x - x) < 0.0001 && Math.abs(last.y - y) < 0.0001) {
				last.corner = last.corner || !!corner;
				return;
			}

			points.push({ x: x, y: y, corner: !!corner });
		}

		push(0, 0, false);
		push(0.07, 0, true);
		push(0.16, 0.17, true);
		push(0.25, 0, true);
		push(0.36, 0, true);
		push(0.40, -0.2, true);
		push(0.445, 1, true);
		push(0.485, -0.42, true);
		push(0.53, 0, true);
		push(0.63, 0, true);
		push(0.765, 0.25, true);
		push(0.9, 0, true);
		push(1, 0, false);

		return points;
	}

	var BEAT = createBeat();

	function clamp(value, min, max) {
		return Math.min(max, Math.max(min, value));
	}

	function readNumber(value, fallback, min, max) {
		var number = fallback;

		if (value && typeof value === 'object' && value.size !== undefined && value.size !== '') {
			number = parseFloat(value.size);
		} else if (typeof value === 'number' || (typeof value === 'string' && value !== '')) {
			number = parseFloat(value);
		}

		if (!isFinite(number)) {
			number = fallback;
		}

		return clamp(number, min, max);
	}

	function readBool(value) {
		return value === 'yes' || value === true || value === 'true' || value === 1 || value === '1';
	}

	function parseColor(input, fallback) {
		var color = (typeof input === 'string' && input.trim()) ? input.trim() : fallback;
		var hex = /^#([0-9a-f]{3,8})$/i.exec(color);

		if (hex) {
			var h = hex[1];

			if (h.length === 3 || h.length === 4) {
				h = h.split('').map(function (channel) {
					return channel + channel;
				}).join('');
			}

			return {
				r: parseInt(h.slice(0, 2), 16),
				g: parseInt(h.slice(2, 4), 16),
				b: parseInt(h.slice(4, 6), 16),
				a: h.length >= 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1
			};
		}

		var rgb = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(color);

		if (rgb) {
			return {
				r: Number(rgb[1]),
				g: Number(rgb[2]),
				b: Number(rgb[3]),
				a: rgb[4] === undefined ? 1 : Number(rgb[4])
			};
		}

		if (color === fallback) {
			return { r: 46, g: 229, b: 157, a: 1 };
		}

		var probe = document.createElement('span');
		probe.style.color = color;
		probe.style.display = 'none';
		document.body.appendChild(probe);
		var resolved = window.getComputedStyle(probe).color;
		probe.parentNode.removeChild(probe);

		return parseColor(resolved, fallback);
	}

	function withOpacity(color, opacityPercent) {
		return {
			r: color.r,
			g: color.g,
			b: color.b,
			a: color.a * (clamp(opacityPercent, 0, 100) / 100)
		};
	}

	function rgba(color, alphaScale) {
		var alpha = color.a * (alphaScale === undefined ? 1 : alphaScale);
		return 'rgba(' + Math.round(color.r) + ',' + Math.round(color.g) + ',' + Math.round(color.b) + ',' + alpha + ')';
	}

	var RESPONSIVE_KEYS = [
		'amplitude',
		'peak_count',
		'peak_density',
		'effect_width',
		'line_width',
		'duration',
		'line_opacity',
		'node_opacity',
		'dot_opacity'
	];

	function isEmptyControl(value) {
		if (value === undefined || value === null || value === '') {
			return true;
		}

		if (typeof value === 'object') {
			return value.size === undefined || value.size === null || value.size === '';
		}

		return false;
	}

	function currentDeviceMode() {
		try {
			if (!window.elementorFrontend || !elementorFrontend.getCurrentDeviceMode) {
				return 'desktop';
			}

			return elementorFrontend.getCurrentDeviceMode() || 'desktop';
		} catch (error) {
			return 'desktop';
		}
	}

	function responsiveValue(raw, controlKey) {
		var mode = currentDeviceMode();
		var devices;
		var index;
		var device;
		var candidate;

		if (mode === 'desktop' || !window.elementorFrontend || !elementorFrontend.breakpoints) {
			return raw[controlKey];
		}

		if (mode === 'widescreen') {
			candidate = raw[controlKey + '_widescreen'];
			return isEmptyControl(candidate) ? raw[controlKey] : candidate;
		}

		devices = elementorFrontend.breakpoints.getActiveBreakpointsList({ withDesktop: true });
		index = devices.indexOf(mode);

		if (index < 0) {
			return raw[controlKey];
		}

		device = mode;

		while (index <= devices.length) {
			if (device === 'desktop') {
				return raw[controlKey];
			}

			candidate = raw[controlKey + '_' + device];

			if (!isEmptyControl(candidate)) {
				return candidate;
			}

			index++;
			device = devices[index];
		}

		return raw[controlKey];
	}

	function applyResponsive(raw) {
		var next = {};
		var key;

		for (key in raw) {
			if (Object.prototype.hasOwnProperty.call(raw, key)) {
				next[key] = raw[key];
			}
		}

		RESPONSIVE_KEYS.forEach(function (controlKey) {
			next[controlKey] = responsiveValue(raw, controlKey);
		});

		return next;
	}

	function normalizeSettings(raw) {
		raw = applyResponsive(raw || {});

		return {
			showNodes: readBool(raw.showNodes !== undefined ? raw.showNodes : raw.show_nodes),
			nodeGlow: readBool(raw.nodeGlow !== undefined ? raw.nodeGlow : raw.node_glow),
			amplitude: readNumber(raw.amplitude, 120, 24, 800),
			peakCount: Math.round(readNumber(raw.peakCount !== undefined ? raw.peakCount : raw.peak_count, 3, 1, 20)),
			peakDensity: readNumber(raw.peakDensity !== undefined ? raw.peakDensity : raw.peak_density, 40, 1, 100),
			effectWidth: readNumber(raw.effectWidth !== undefined ? raw.effectWidth : raw.effect_width, 100, 5, 100),
			lineWidth: readNumber(raw.lineWidth !== undefined ? raw.lineWidth : raw.line_width, 2, 1, 40),
			duration: readNumber(raw.duration, 6, 0.4, 60),
			lineColor: withOpacity(parseColor(raw.lineColor || raw.line_color, '#2EE59D'), readNumber(raw.lineOpacity !== undefined ? raw.lineOpacity : raw.line_opacity, 100, 0, 100)),
			nodeColor: withOpacity(parseColor(raw.nodeColor || raw.node_color, '#FFFFFF'), readNumber(raw.nodeOpacity !== undefined ? raw.nodeOpacity : raw.node_opacity, 100, 0, 100)),
			dotColor: withOpacity(parseColor(raw.dotColor || raw.dot_color, '#FFFFFF'), readNumber(raw.dotOpacity !== undefined ? raw.dotOpacity : raw.dot_opacity, 100, 0, 100))
		};
	}

	function isCorner(previous, current, next) {
		var ax = current.x - previous.x;
		var ay = current.y - previous.y;
		var bx = next.x - current.x;
		var by = next.y - current.y;
		var al = Math.hypot(ax, ay) || 1;
		var bl = Math.hypot(bx, by) || 1;
		var dot = (ax / al) * (bx / bl) + (ay / al) * (by / bl);
		var angle = Math.acos(clamp(dot, -1, 1));

		return angle > 0.45;
	}

	function interpolate(a, b, x) {
		var span = b.x - a.x;
		var t = span === 0 ? 0 : (x - a.x) / span;

		return {
			x: x,
			y: a.y + (b.y - a.y) * t,
			corner: false
		};
	}

	function pointAtX(points, x) {
		if (!points.length) {
			return { x: x, y: 0, corner: false };
		}

		if (x <= points[0].x) {
			return { x: x, y: points[0].y, corner: false };
		}

		for (var i = 1; i < points.length; i++) {
			if (x <= points[i].x) {
				return interpolate(points[i - 1], points[i], x);
			}
		}

		return { x: x, y: points[points.length - 1].y, corner: false };
	}

	function buildPoints(width, height, settings) {
		var nodeRadius = Math.max(2.5, settings.lineWidth * 1.25);
		var dotRadius = Math.max(nodeRadius * 1.85, settings.lineWidth * 2.4);
		var glowBlur = nodeRadius * 5.5;
		var pad = Math.max(dotRadius, settings.lineWidth * 0.5) + 2;

		if (settings.showNodes) {
			pad = Math.max(pad, nodeRadius + (settings.nodeGlow ? glowBlur : 0) + 1);
		}

		pad = Math.min(pad, Math.max(2, height * 0.3));

		var minY = BEAT[0].y;
		var maxY = BEAT[0].y;
		var index;

		for (index = 1; index < BEAT.length; index++) {
			minY = Math.min(minY, BEAT[index].y);
			maxY = Math.max(maxY, BEAT[index].y);
		}

		var span = (maxY - minY) || 1;
		var usable = Math.max(1, height - pad * 2);

		function mapY(y) {
			var t = (y - minY) / span;
			return pad + (1 - t) * usable;
		}

		// Density 1 keeps a wide flat gap. Density 100 pulls neighboring peaks together.
		var gapRatio = 0.78 - ((settings.peakDensity - 1) / 99) * 0.70;
		var slot = width / settings.peakCount;
		var beatWidth = slot * (1 - gapRatio);
		var raw = [];
		var beatIndex;
		var pointIndex;

		for (beatIndex = 0; beatIndex < settings.peakCount; beatIndex++) {
			var origin = beatIndex * slot;

			for (pointIndex = 0; pointIndex < BEAT.length; pointIndex++) {
				raw.push({
					x: origin + BEAT[pointIndex].x * beatWidth,
					y: mapY(BEAT[pointIndex].y),
					corner: !!BEAT[pointIndex].corner
				});
			}
		}

		if (!raw.length || raw[raw.length - 1].x < width - 0.5) {
			raw.push({
				x: width,
				y: raw.length ? raw[raw.length - 1].y : height / 2,
				corner: false
			});
		}

		return {
			points: raw.map(function (point, pointIndex) {
				var corner = !!point.corner;

				if (!corner && pointIndex > 0 && pointIndex < raw.length - 1) {
					corner = isCorner(raw[pointIndex - 1], point, raw[pointIndex + 1]);
				}

				return {
					x: point.x,
					y: point.y,
					corner: corner
				};
			}),
			nodeRadius: nodeRadius,
			dotRadius: dotRadius,
			glowBlur: glowBlur
		};
	}

	function clipPath(points, x0, x1) {
		var out = [];

		if (x1 <= x0) {
			return out;
		}

		function push(point) {
			var last = out[out.length - 1];

			if (last && Math.abs(last.x - point.x) < 0.05 && Math.abs(last.y - point.y) < 0.05) {
				if (point.corner) {
					last.corner = true;
				}
				return;
			}

			out.push(point);
		}

		for (var i = 1; i < points.length; i++) {
			var a = points[i - 1];
			var b = points[i];

			if (b.x < x0 || a.x > x1) {
				continue;
			}

			var from = a.x < x0 ? interpolate(a, b, x0) : a;
			var to = b.x > x1 ? interpolate(a, b, x1) : b;

			push(from);
			push({
				x: to.x,
				y: to.y,
				corner: !!(b.corner && b.x >= x0 && b.x <= x1)
			});
		}

		return out;
	}

	function settingsKey(settings, width, height) {
		return [
			width,
			height,
			settings.showNodes,
			settings.nodeGlow,
			settings.peakCount,
			settings.peakDensity,
			settings.lineWidth
		].join('|');
	}

	function mount(canvas, readSettings) {
		var stage = canvas.parentElement;
		var context = canvas.getContext('2d');
		var running = true;
		var frame = 0;
		var cacheKey = '';
		var geometry = null;
		var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
		var startedAt = performance.now();

		function resize() {
			var cssWidth = canvas.clientWidth;
			var cssHeight = canvas.clientHeight;
			var dpr = Math.min(window.devicePixelRatio || 1, 3);
			var bufferWidth = Math.max(1, Math.round(cssWidth * dpr));
			var bufferHeight = Math.max(1, Math.round(cssHeight * dpr));

			if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
				canvas.width = bufferWidth;
				canvas.height = bufferHeight;
			}

			context.setTransform(dpr, 0, 0, dpr, 0, 0);

			return {
				width: cssWidth,
				height: cssHeight
			};
		}

		function draw(now) {
			var settings = normalizeSettings(readSettings());
			var size = resize();

			if (size.width < 2 || size.height < 2) {
				return;
			}

			var key = settingsKey(settings, size.width, size.height);

			if (key !== cacheKey) {
				cacheKey = key;
				geometry = buildPoints(size.width, size.height, settings);
			}

			var progress;
			var staticFrame = reduceMotion.matches;

			if (staticFrame) {
				progress = 1;
			} else {
				var elapsed = (now - startedAt) % (settings.duration * 1000);
				progress = elapsed / (settings.duration * 1000);
			}

			var headX = progress * size.width;
			var tailStart = staticFrame ? 0 : Math.max(0, headX - size.width * TAIL_RATIO);
			var visible = clipPath(geometry.points, tailStart, headX);

			context.clearRect(0, 0, size.width, size.height);

			if (visible.length > 1 && settings.lineColor.a > 0) {
				context.beginPath();
				context.moveTo(visible[0].x, visible[0].y);

				for (var i = 1; i < visible.length; i++) {
					context.lineTo(visible[i].x, visible[i].y);
				}

				context.lineWidth = settings.lineWidth;
				context.lineJoin = 'miter';
				context.miterLimit = 4;
				context.lineCap = 'round';

				if (staticFrame) {
					context.strokeStyle = rgba(settings.lineColor, 1);
				} else {
					var gradient = context.createLinearGradient(tailStart, 0, Math.max(tailStart + 0.01, headX), 0);
					gradient.addColorStop(0, rgba(settings.lineColor, 0));
					gradient.addColorStop(0.35, rgba(settings.lineColor, 0.18));
					gradient.addColorStop(0.72, rgba(settings.lineColor, 0.62));
					gradient.addColorStop(1, rgba(settings.lineColor, 1));
					context.strokeStyle = gradient;
				}

				context.stroke();
			}

			if (settings.showNodes && settings.nodeColor.a > 0) {
				for (var n = 0; n < geometry.points.length; n++) {
					var node = geometry.points[n];

					if (!node.corner || node.x < tailStart || node.x > headX) {
						continue;
					}

					var fade = staticFrame || headX <= tailStart ? 1 : (node.x - tailStart) / (headX - tailStart);

					context.save();
					if (settings.nodeGlow) {
						var halo = context.createRadialGradient(node.x, node.y, geometry.nodeRadius * 0.4, node.x, node.y, geometry.glowBlur);
						halo.addColorStop(0, rgba(settings.nodeColor, fade * 0.95));
						halo.addColorStop(0.4, rgba(settings.nodeColor, fade * 0.35));
						halo.addColorStop(1, rgba(settings.nodeColor, 0));
						context.fillStyle = halo;
						context.beginPath();
						context.arc(node.x, node.y, geometry.glowBlur, 0, Math.PI * 2);
						context.fill();
					}
					context.fillStyle = rgba(settings.nodeColor, fade);
					context.beginPath();
					context.arc(node.x, node.y, geometry.nodeRadius, 0, Math.PI * 2);
					context.fill();
					context.restore();
				}
			}

			if (settings.dotColor.a > 0) {
				var head = pointAtX(geometry.points, headX);
				context.save();
				context.fillStyle = rgba(settings.dotColor, 1);
				context.beginPath();
				context.arc(head.x, head.y, geometry.dotRadius, 0, Math.PI * 2);
				context.fill();
				context.restore();
			}
		}

		function loop(now) {
			if (!running) {
				return;
			}

			draw(now);
			frame = window.requestAnimationFrame(loop);
		}

		function onMotionChange() {
			window.cancelAnimationFrame(frame);
			if (running) {
				startedAt = performance.now();
				loop(performance.now());
			}
		}

		var observer = null;

		if (window.ResizeObserver) {
			observer = new ResizeObserver(function () {
				cacheKey = '';
				if (reduceMotion.matches) {
					draw(performance.now());
				}
			});
			observer.observe(stage);
		}
		if (reduceMotion.addEventListener) {
			reduceMotion.addEventListener('change', onMotionChange);
		}

		loop(performance.now());

		return {
			destroy: function () {
				running = false;
				window.cancelAnimationFrame(frame);
				if (observer) {
					observer.disconnect();
				}
				if (reduceMotion.removeEventListener) {
					reduceMotion.removeEventListener('change', onMotionChange);
				}
			}
		};
	}

	window.SolemanHeartbeatLine = {
		mount: mount,
		normalizeSettings: normalizeSettings
	};

	function registerHandler() {
		if (!window.elementorFrontend || !elementorFrontend.hooks || !window.elementorModules) {
			return;
		}

		var Handler = class SolemanHeartbeatLineHandler extends elementorModules.frontend.handlers.Base {
			onInit() {
				super.onInit();
				this.stage = this.$element.find('.shl-stage').get(0);
				this.canvas = this.$element.find('.shl-canvas').get(0);

				if (!this.stage || !this.canvas) {
					return;
				}

				this.engine = mount(this.canvas, this.readSettings.bind(this));
			}

			readRaw() {
				try {
					return this.getElementSettings() || {};
				} catch (error) {
					return {};
				}
			}

			readSettings() {
				var raw = this.readRaw();
				var settings = normalizeSettings(raw);

				if (!this.cachedSettings || this.cachedSettings.effectWidth !== settings.effectWidth || this.cachedSettings.amplitude !== settings.amplitude) {
					this.cachedSettings = settings;
					this.applyBox();
				}

				return raw;
			}

			applyBox() {
				if (!this.stage || !this.cachedSettings) {
					return;
				}

				this.stage.style.width = this.cachedSettings.effectWidth + '%';
				this.stage.style.height = this.cachedSettings.amplitude + 'px';
			}

			onElementChange() {
				this.cachedSettings = null;
			}

			onDestroy() {
				if (this.engine) {
					this.engine.destroy();
					this.engine = null;
				}

				super.onDestroy();
			}
		};

		elementorFrontend.hooks.addAction('frontend/element_ready/soleman-heartbeat-line.default', function ($element) {
			elementorFrontend.elementsHandler.addHandler(Handler, { $element: $element });
		});
	}

	if (window.elementorFrontend && elementorFrontend.hooks) {
		registerHandler();
	} else {
		window.addEventListener('elementor/frontend/init', registerHandler, { once: true });
	}
})();
