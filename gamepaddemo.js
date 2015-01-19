(function () {
	"use strict";

	var padElem = [];
	var animActive = false;
	var gamepadCount = 0;

	/**
	 * Start or stop the onFrame update
	 */
	function runAnim(run) {
		if (run && !animActive) {
			window.requestAnimationFrame(onFrame);
			animActive = true;
		}

		else if (!run) {
			animActive = false;
		}
	}

	/**
	 * Create a gamepad structure
	 */
	function createPad(gamepad) {
		var index = gamepad.index;
		var i, e, e2, e3, html;
		var padElemStruct = {};

		var outer = eid('gamepads').children[gamepad.index];

		if (!outer) { outer = ce('div'); };

		padElemStruct.elem = outer;
		padElemStruct.index = index;

		outer.className = "gamepad";
		//outer.setAttribute('data-index', index);

		// title
		html = '<div class="gamepad-title">' +
			"Gamepad " + index + ", " + (gamepad.connected?'':'dis') + "connected" +
			'</div>';

		// id
		html += ('<div class="gamepad-id">' + gamepad.id + '</div>');

		// mapping
		html += ('<div class="gamepad-mapping">Mapping: ' + gamepad.mapping + '</div>');

		// buttons
		html += '<div class="gamepad-button-box">'

		for (i = 0; i < gamepad.buttons.length; i++) {
			html += '<div class="gamepad-button-inner-box">';
			html += '<div class="gamepad-button">0</div>';
			html += ('<div class="gamepad-button-label">' + i + '</div>');
			html += '</div>'; // gamepad-button-inner-box
		}

		html += '</div>'; // gamepad-button-box

		outer.innerHTML = html;

		// axes
		html += '<div class="gamepad-axes-box">';

		for (i = 0; i < gamepad.axes.length; i += 2) {
			var oddManOut = (i == gamepad.axes.length - 1);

			html += '<div class="gamepad-axes-inner-box">';

			html += ('<div class="gamepad-axis-panel">' +
				'<div class="gamepad-axis-pip"></div>' +
				'</div>' +
				'<div class="gamepad-axis-labels">' + i);
				
			if (!oddManOut) {
				html += (',' + (i+1));
			}

			html += ('</div>' +
				'<div class="gamepad-axis-values">' +
				'<span class="gamepad-axis-value-' + i + '">0</span>');

			if (!oddManOut) {
				html += (',<span class="gamepad-axis-value-' + (i+1) + '">0</span>');
			}

			html += '</div>'; // gamepad-axis-values
			html += '</div>'; // gamepad-axes-inner-box
		}

		html += '</div>'; // gamepad-axes-box

		outer.innerHTML = html;

		padElemStruct.buttons = outer.querySelector('.gamepad-button-box');
		padElemStruct.axes = outer.querySelector('.gamepad-axes-box');

		padElem[index] = padElemStruct;

		var childAfter = eid('gamepads').children[index+1];
		eid('gamepads').insertBefore(outer, childAfter);
	}

	/**
	 * Destroy gamepad HTML
	 */
	function destroyPad(gamepad) {
		var padElem = eid('gamepads').children[gamepad.index];
		
		// gamepad element
		padElem.innerHTML = '';
	}

	/**
	 * createElement
	 */
	function ce(type) {
		return document.createElement(type);
	}

	/**
	 * getElementById
	 */
	function eid(id) {
		return document.getElementById(id);
	}

	/**
	 * Handle pad connected
	 */
	function onPadConnected(ev) {
		gamepadCount++;
		eid('no-gamepads').className = 'nodisplay';
		eid('gamepads').className = '';

		console.log(ev);

		var gamepad = ev.gamepad;

		createPad(gamepad);

		runAnim(true);
	}

	/**
	 * Handle pad disconnected
	 */
	function onPadDisconnected(ev) {
		var gamepad = ev.gamepad;

		gamepadCount--;

		if (gamepadCount === 0) {
			eid('no-gamepads').className = '';
		}

		console.log(ev);

		destroyPad(gamepad);
	}

	/**
	 * Update pad details
	 */
	function updateDetails(gamepad) {

		function prettyPrint(v) {
			if (v >= 0) {
				v = '+' + v;
			}
			v = '' + v;

			if (v.length < 3) {
				v += '.00';
			} else {
				v = v.substr(0, 5);
			}

			return v;
		}

		var elemInfo = padElem[gamepad.index];

		if (!elemInfo) { return; } // might not have added to DOM yet

		var buttonbox = elemInfo.buttons;
		var buttonBoxElem = buttonbox.children;
		var buttonElem;
		var gamepadButtons = gamepad.buttons;
		var gamepadButton;
		var i;
		var className;

		for (i = 0; i < gamepadButtons.length; i++) {
			gamepadButton = gamepadButtons[i];

			if (gamepadButton.pressed) {
				className = "gamepad-button pressed";
			} else {
				className = "gamepad-button";
			}

			buttonElem = buttonBoxElem[i].firstChild;

			buttonElem.className = className;
			buttonElem.innerText = ('' + gamepadButton.value).substr(0, 4);
		}

		var axesBox = elemInfo.axes;
		var axesBoxElemList = axesBox.children;
		var axisBoxElem;
		var gamepadAxes = gamepad.axes;
		var value, pos;
		var axisBoxIndex;
		var pip;
		var valueElem;

		for (i = 0; i < gamepadAxes.length; i++) {
			value = gamepad.axes[i];

			axisBoxIndex = (i/2)|0;

			axisBoxElem = axesBoxElemList[axisBoxIndex];
			pip = axisBoxElem.querySelector('.gamepad-axis-pip');

			pos = 60 * (value / 2 + 0.5) + 'px';

			if (i%2 === 0) {
				pip.style.left = pos;
			} else {
				pip.style.top = pos;
			}

			valueElem = axisBoxElem.querySelector('.gamepad-axis-value-' + i);
			valueElem.innerHTML = prettyPrint(value);
		}
	}

	/**
	 * Draw a frame
	 */
	function onFrame(timestamp) {
		var gamepads = navigator.getGamepads();
		var gamepad;
		var i;

		for (i = 0; i < gamepads.length; i++) {
			gamepad = gamepads[i];

			// disconnected gamepads are undefined in Chrome
			if (!gamepad) { continue; }

			updateDetails(gamepad);

		}

		if (animActive) {
			window.requestAnimationFrame(onFrame);
		}
	}

	/**
	 * Detect attached gamepads, or wait for some to show up
	 */
	function detectOrWait() {
		var gamepads = navigator.getGamepads();

		var detected = false;

		for (var i = 0; i < gamepads.length; i++) {
			if (gamepads[i]) {
				createPad(gamepads[i]);
				detected = true;
			}
		}

		if (detected) {
			eid('gamepads').className = '';
			runAnim(true);
		} else {
			eid('no-gamepads').className = '';
		}
	}

	/**
	 * Return true if gamepads are supported
	 */
	function gamepadSupport() {
		return !!navigator.getGamepads;
	}


	function onLoad() {
		window.addEventListener('gamepadconnected', onPadConnected);
		window.addEventListener('gamepaddisconnected', onPadDisconnected);

		if (!gamepadSupport()) {
			eid('no-support').className = '';
		} else {
			detectOrWait();
		}
	}

	window.addEventListener('load', onLoad);

	window.runAnim = runAnim; // so we can halt it in the debugger
}());

